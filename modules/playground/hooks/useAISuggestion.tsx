import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";


export interface RAGChunk {
    filePath: string;
    content: string;
    score?: number;
}

interface AISuggestionsState {
    suggestion: string | null;
    isLoading: boolean;
    position: { line: number; column: number } | null;
    decoration: string[];
    isEnabled: boolean;
    ragChunks: RAGChunk[];
}

interface FetchOptions {
    fileName?: string;
}

interface UseAISuggestionsReturn extends AISuggestionsState {
    toggleEnabled: () => void;
    fetchSuggestion: (type: string, editor: any, options?: FetchOptions) => void;
    acceptSuggestion: (editor: any, monaco: any) => void;
    rejectSuggestion: (editor: any) => void;
    clearSuggestion: (editor: any) => void;
}

export const useAISuggestions = (playgroundId: string): UseAISuggestionsReturn => {
    const [state, setState] = useState<AISuggestionsState>({
        suggestion: null,
        isLoading: false,
        position: null,
        decoration: [],
        isEnabled: true,
        ragChunks: [],
    });
    const ragDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleEnabled = useCallback(() => {
        setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
    }, [])

    const fetchSuggestion = useCallback((type: string, editor: any, options?: FetchOptions) => {
        if (ragDebounceRef.current) clearTimeout(ragDebounceRef.current);

        ragDebounceRef.current = setTimeout(() => {
            ragDebounceRef.current = null;
            setState((currentState) => {

                if (!currentState.isEnabled) {
                    return currentState
                }

                if (!editor) {
                    return currentState
                }

                const model = editor.getModel();
                const cursorPosition = editor.getPosition()

                if (!model || !cursorPosition) {
                    return currentState
                }

                const newState = { ...currentState, isLoading: true };

                (async () => {
                    const position = { line: cursorPosition.lineNumber, column: cursorPosition.column };
                    const fileContent = model.getValue();
                    const payload = {
                        fileContent,
                        cursorLine: cursorPosition.lineNumber - 1,
                        cursorColumn: cursorPosition.column - 1,
                        suggestionType: type,
                        ...(options?.fileName && { fileName: options.fileName }),
                    };
                    const useStream = true; // PRD FR-AI-01: real-time streaming
                    try {
                        const lines = fileContent.split("\n");
                        const cursorLineIndex = cursorPosition.lineNumber - 1;
                        const contextStart = Math.max(0, cursorLineIndex - 5);
                        const contextEnd = Math.min(lines.length, cursorLineIndex + 6);
                        const querySnippet = lines.slice(contextStart, contextEnd).join("\n").trim().slice(0, 500);
                        if (querySnippet && playgroundId.trim()) {
                            const ragRes = await fetch("/api/rag/search", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    query: querySnippet,
                                    topK: 6,
                                    playgroundId: playgroundId.trim(),
                                }),
                            }).catch(() => null);
                            if (ragRes?.ok) {
                                const ragData = await ragRes.json();
                                const chunks = (ragData.chunks ?? []).map((c: { filePath: string; content: string; score?: number }) => ({
                                    filePath: c.filePath,
                                    content: c.content,
                                    score: c.score,
                                }));
                                setState((prev) => ({ ...prev, ragChunks: chunks }));
                            }
                        }
                        if (useStream) {
                            const res = await fetch("/api/code-completion/stream", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...payload,
                                playgroundId: playgroundId.trim() || undefined,
                            }),
                        });
                        if (!res.ok || !res.body) {
                            const errData = await res.json().catch(() => ({}));
                            throw new Error(errData?.error || res.statusText || "Stream failed");
                        }
                        const reader = res.body.getReader();
                        const decoder = new TextDecoder();
                        let accumulated = "";
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            accumulated += decoder.decode(value, { stream: true });
                            setState((prev) => ({
                                ...prev,
                                suggestion: accumulated,
                                position,
                                isLoading: accumulated.length === 0,
                            }));
                        }
                        let suggestionText = accumulated.trim();
                        if (suggestionText.includes("```")) {
                            const codeMatch = suggestionText.match(/```[\w]*\n?([\s\S]*?)```/);
                            suggestionText = codeMatch ? codeMatch[1].trim() : suggestionText;
                        }
                        setState((prev) => ({
                            ...prev,
                            suggestion: suggestionText || prev.suggestion,
                            position,
                            isLoading: false,
                        }));
                        return;
                    }
                    const response = await fetch("/api/code-completion", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...payload,
                            playgroundId: playgroundId.trim() || undefined,
                        }),
                    });
                    if (!response.ok) {
                        throw new Error(`API responded with status ${response.status}`);
                    }
                    const data = await response.json();
                    if (data.suggestion) {
                        const suggestionText = data.suggestion.trim();
                        setState((prev) => ({
                            ...prev,
                            suggestion: suggestionText,
                            position,
                            isLoading: false,
                        }));
                    } else {
                        setState((prev) => ({ ...prev, isLoading: false }));
                    }
                } catch (error) {
                    console.error("Error fetching code suggestion:", error);
                    setState((prev) => ({ ...prev, isLoading: false }));
                    const msg = error instanceof Error ? error.message : "Suggestion failed";
                    if (/ollama|502|connection|fetch|failed/i.test(msg)) {
                        toast.error("AI unavailable. Run: ollama run codellama", { duration: 5000 });
                    } else {
                        toast.error("Suggestion failed. Try again or check Ollama.");
                    }
                }
            })();

                return newState
            })
        }, 400);
    }, [playgroundId])


    const acceptSuggestion = useCallback((editor: any, monaco: any) => {
        setState((currentState) => {
            if (!currentState.suggestion || !currentState.position || !editor || !monaco) {
                return currentState;
            }
            const { line, column } = currentState.position;
            const sanitizedSuggestion = currentState.suggestion.replace(/^\d+:\s*/gm, "");
            editor.executeEdits("", [
                {
                    range: new monaco.Range(line, column, line, column),
                    text: sanitizedSuggestion,
                    forceMoveMarkers: true,
                },
            ]);
            if (editor && currentState.decoration.length > 0) {
                editor.deltaDecorations(currentState.decoration, []);
            }
            return {
                ...currentState,
                suggestion: null,
                position: null,
                decoration: [],
            };
        });
    }, []);

    const rejectSuggestion = useCallback((editor:any)=>{
            setState((currentState)=>{
                 if(editor && currentState.decoration.length > 0){
                    editor.deltaDecorations(currentState.decoration , [])
                }

                return {
                    ...currentState,
                    suggestion:null,
                    position:null,
                    decoration:[]
                }
            })
    },[]);
 
    const clearSuggestion = useCallback((editor: any) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }
      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);


  return {
    ...state,
    toggleEnabled,
    fetchSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestion
  }

}