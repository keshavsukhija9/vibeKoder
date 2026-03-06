"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlaygroundEditor } from "@/modules/playground/components/playground-editor";
import {
  PlaygroundErrorView,
  PlaygroundLoadingView,
  PlaygroundNoTemplateView,
  PlaygroundNoFilesView,
} from "@/modules/playground/components/playground-views";
import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";
import ToggleAI from "@/modules/playground/components/toggle-ai";
import { ActivityBar } from "@/modules/playground/components/activity-bar";
import { StatusBar } from "@/modules/playground/components/status-bar";
import { RAGContextChip } from "@/components/ui/rag-context-chip";
import { useAISuggestions } from "@/modules/playground/hooks/useAISuggestion";
import { useFileExplorer, type OpenFile } from "@/modules/playground/hooks/useFileExplorer";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { findFilePath, flattenTemplateToFiles, getFirstFileFromTemplate } from "@/modules/playground/lib";
import {
  TemplateFile,
  TemplateFolder,
} from "@/modules/playground/lib/path-to-json";
import WebContainerPreview from "@/modules/webcontainers/components/webcontainer-preview";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebContainer";
import {
  FileText,
  PanelLeftClose,
  Save,
  Settings,
  X,
  Database,
  GitBranch,
  HelpCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

const MainPlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [indexingRAG, setIndexingRAG] = useState(false);
  const [structureResult, setStructureResult] = useState<{
    cycles: string[][];
    warnings: { type: string; message: string; paths?: string[] }[];
  } | null>(null);
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [structureLoading, setStructureLoading] = useState(false);

  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);

    const aiSuggestions = useAISuggestions();

  const {
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
    activeFileId,
    closeAllFiles,
    closeFile,
    openFile,
    openFiles,

    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    updateFileContent
  } = useFileExplorer();

  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
    // @ts-ignore
  } = useWebContainer({ templateData });

  const lastSyncedContent = useRef<Map<string, string>>(new Map());
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    setPlaygroundId(id);
    hasAutoOpenedRef.current = false;
  }, [id, setPlaygroundId]);

  useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length]);

  useEffect(() => {
    if (!templateData || openFiles.length > 0) return;
    const first = getFirstFileFromTemplate(templateData);
    if (first && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      openFile(first);
    }
  }, [templateData, openFiles.length, openFile]);

  // Create wrapper functions that pass saveTemplateData
  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) => {
      return handleAddFile(
        newFile,
        parentPath,
        writeFileSync!,
        instance,
        saveTemplateData
      );
    },
    [handleAddFile, writeFileSync, instance, saveTemplateData]
  );

  const wrappedHandleAddFolder = useCallback(
    (newFolder: TemplateFolder, parentPath: string) => {
      return handleAddFolder(newFolder, parentPath, instance, saveTemplateData);
    },
    [handleAddFolder, instance, saveTemplateData]
  );

  const wrappedHandleDeleteFile = useCallback(
    (file: TemplateFile, parentPath: string) => {
      return handleDeleteFile(file, parentPath, saveTemplateData);
    },
    [handleDeleteFile, saveTemplateData]
  );

  const wrappedHandleDeleteFolder = useCallback(
    (folder: TemplateFolder, parentPath: string) => {
      return handleDeleteFolder(folder, parentPath, saveTemplateData);
    },
    [handleDeleteFolder, saveTemplateData]
  );

  const wrappedHandleRenameFile = useCallback(
    (
      file: TemplateFile,
      newFilename: string,
      newExtension: string,
      parentPath: string
    ) => {
      return handleRenameFile(
        file,
        newFilename,
        newExtension,
        parentPath,
        saveTemplateData
      );
    },
    [handleRenameFile, saveTemplateData]
  );

  const wrappedHandleRenameFolder = useCallback(
    (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
      return handleRenameFolder(
        folder,
        newFolderName,
        parentPath,
        saveTemplateData
      );
    },
    [handleRenameFolder, saveTemplateData]
  );

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);

  function validateSavePayload(templateData: TemplateFolder | null): { valid: boolean; error?: string } {
    if (!templateData) return { valid: false, error: "No template data" };
    return { valid: true };
  }

  async function persistTemplate(payload: TemplateFolder): Promise<{ ok: boolean; error?: string; data?: TemplateFolder }> {
    try {
      const data = await saveTemplateData(payload);
      return { ok: true, data: data ?? payload };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  function handleSaveError(err: unknown): void {
    console.error("Error saving file:", err);
    toast.error(err instanceof Error ? err.message : "Failed to save file");
  }

  function buildUpdatedTemplateData(latest: TemplateFolder, fileToSave: OpenFile): TemplateFolder {
    const updated = JSON.parse(JSON.stringify(latest)) as TemplateFolder;
    const updateItems = (items: TemplateFolder["items"]): TemplateFolder["items"] =>
      items.map((item) =>
        "folderName" in item
          ? { ...item, items: updateItems(item.items) }
          : item.filename === fileToSave.filename && item.fileExtension === fileToSave.fileExtension
            ? { ...item, content: fileToSave.content }
            : item
      );
    updated.items = updateItems(updated.items);
    return updated;
  }

  async function syncFileToWebContainer(filePath: string, fileToSave: OpenFile): Promise<void> {
    if (!writeFileSync) return;
    await writeFileSync(filePath, fileToSave.content);
    lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
    if (instance?.fs) await instance.fs.writeFile(filePath, fileToSave.content);
  }

  const handleFileSelect = (file: TemplateFile) => {
    openFile(file);
  };

  const handleSave = useCallback(
    async (fileId?: string) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;
      const fileToSave = openFiles.find((f) => f.id === targetFileId);
      if (!fileToSave) return;
      const latestTemplateData = useFileExplorer.getState().templateData;
      const validation = validateSavePayload(latestTemplateData);
      if (!validation.valid) { toast.error(validation.error); return; }
      const filePath = findFilePath(fileToSave, latestTemplateData!);
      if (!filePath) { toast.error(`Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`); return; }
      const updatedTemplateData = buildUpdatedTemplateData(latestTemplateData!, fileToSave);
      await syncFileToWebContainer(filePath, fileToSave);
      const persistResult = await persistTemplate(updatedTemplateData);
      if (!persistResult.ok) { handleSaveError(new Error(persistResult.error)); return; }
      setTemplateData(persistResult.data ?? updatedTemplateData);
      setOpenFiles(openFiles.map((f) => f.id === targetFileId ? { ...f, content: fileToSave.content, originalContent: fileToSave.content, hasUnsavedChanges: false } : f));
      toast.success(`Saved ${fileToSave.filename}.${fileToSave.fileExtension}`);
    },
    [
      activeFileId,
      openFiles,
      writeFileSync,
      instance,
      saveTemplateData,
      setTemplateData,
      setOpenFiles,
    ]
  );

    const handleSaveAll = async () => {
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);

    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }

    try {
      await Promise.all(unsavedFiles.map((f) => handleSave(f.id)));
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch (error) {
      toast.error("Failed to save some files");
    }
  };

  const handleIndexForAI = useCallback(async () => {
    if (!templateData) return;
    setIndexingRAG(true);
    try {
      const files = flattenTemplateToFiles(templateData);
      const res = await fetch("/api/rag/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Index failed");
      toast.success(`Indexed ${data.chunksIndexed ?? 0} chunks for AI context`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Index failed. Run: ollama pull nomic-embed-text");
    } finally {
      setIndexingRAG(false);
    }
  }, [templateData]);

  const handleCheckStructure = useCallback(() => {
    if (!templateData) return;
    setStructureLoading(true);
    setStructureResult(null);
    const files = flattenTemplateToFiles(templateData);
    const worker = new Worker(
      new URL("../../../lib/ast/worker.ts", import.meta.url)
    );
    worker.postMessage({ files });
    worker.onmessage = (e: MessageEvent<{ cycles: string[][]; warnings: { type: string; message: string; paths?: string[] }[] }>) => {
      const data = e.data;
      setStructureResult({ cycles: data.cycles ?? [], warnings: data.warnings ?? [] });
      setStructureDialogOpen(true);
      setStructureLoading(false);
      if ((data.cycles?.length ?? 0) > 0) toast.warning(`${data.cycles?.length ?? 0} circular dependency(ies) found`);
      else toast.success("No circular dependencies");
      worker.terminate();
    };
    worker.onerror = () => {
      setStructureLoading(false);
      toast.error("Structure check failed");
      worker.terminate();
    };
  }, [templateData]);


  useEffect(()=>{
    const handleKeyDown = (e:KeyboardEvent)=>{
      if(e.ctrlKey && e.key === "s"){
        e.preventDefault()
        handleSave()
      }
    }
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
  },[handleSave]);

  if (error) return <PlaygroundErrorView error={error} />;
  if (isLoading) return <PlaygroundLoadingView />;
  if (!templateData) return <PlaygroundNoTemplateView />;

  const [explorerOpen, setExplorerOpen] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setExplorerOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex min-h-[calc(100vh-0px)] w-full bg-[var(--vibe-bg)]">
        <ActivityBar
          explorerActive={explorerOpen}
          onToggleExplorer={() => setExplorerOpen((o) => !o)}
        />
        {explorerOpen && (
          <div className="w-64 shrink-0 border-r border-border flex flex-col bg-sidebar overflow-hidden">
            <div className="px-2 py-2 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                Explorer
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <TemplateFileTree
                data={templateData!}
                onFileSelect={handleFileSelect}
                selectedFile={activeFile}
                title=""
                onAddFile={wrappedHandleAddFile}
                onAddFolder={wrappedHandleAddFolder}
                onDeleteFile={wrappedHandleDeleteFile}
                onDeleteFolder={wrappedHandleDeleteFolder}
                onRenameFile={wrappedHandleRenameFile}
                onRenameFolder={wrappedHandleRenameFolder}
              />
            </div>
          </div>
        )}
        <SidebarInset className="flex flex-col min-w-0 flex-1">
          <header className="flex h-9 shrink-0 items-center gap-1 border-b border-border px-2 bg-background">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setExplorerOpen((o) => !o)}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Toggle Explorer (Ctrl+B)</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-4 mr-1" />

            <div className="flex flex-1 items-center gap-2">
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-medium">
                    {playgroundData?.title || "Code Playground"}
                  </h1>
                  {id === "demo" && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      Demo — sign in to save
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {openFiles.length} File(s) Open
                  {hasUnsavedChanges && " • Unsaved changes"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave()}
                      disabled={!activeFile || !activeFile.hasUnsavedChanges}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save (Ctrl+S)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveAll}
                      disabled={!hasUnsavedChanges}
                    >
                      <Save className="h-4 w-4" /> All
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save All (Ctrl+Shift+S)</TooltipContent>
                </Tooltip>

               <ToggleAI
                isEnabled={aiSuggestions.isEnabled}
                onToggle={aiSuggestions.toggleEnabled}
                suggestionLoading={aiSuggestions.isLoading}
               />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-muted-foreground">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="end">
                    <p className="font-medium text-sm mb-2">Keyboard shortcuts</p>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Ctrl+B</kbd> Toggle Explorer</li>
                      <li><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Ctrl+S</kbd> Save file</li>
                      <li><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Ctrl+Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Double Enter</kbd> AI suggestion</li>
                      <li><kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Tab</kbd> Accept suggestion</li>
                    </ul>
                  </PopoverContent>
                </Popover>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                    >
                      {isPreviewVisible ? "Hide" : "Show"} Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleIndexForAI}
                      disabled={!templateData || indexingRAG}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      {indexingRAG ? "Indexing…" : "Index codebase for AI"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleCheckStructure}
                      disabled={!templateData || structureLoading}
                    >
                      <GitBranch className="h-4 w-4 mr-2" />
                      {structureLoading ? "Checking…" : "Check dependency structure"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={closeAllFiles}>
                      Close All Files
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={structureDialogOpen} onOpenChange={setStructureDialogOpen}>
                  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Codebase structure</DialogTitle>
                    </DialogHeader>
                    {structureResult && (
                      <div className="space-y-4 text-sm">
                        {structureResult.cycles.length > 0 && (
                          <div>
                            <p className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                              Circular dependencies ({structureResult.cycles.length})
                            </p>
                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                              {structureResult.cycles.map((cycle, i) => (
                                <li key={i}>{cycle.join(" → ")}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {structureResult.warnings.length > 0 && (
                          <div>
                            <p className="font-medium mb-2">Warnings</p>
                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                              {structureResult.warnings.map((w, i) => (
                                <li key={i}>{w.message}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {structureResult.cycles.length === 0 && structureResult.warnings.length === 0 && (
                          <p className="text-muted-foreground">No circular dependencies or warnings.</p>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col min-h-0">
            {openFiles.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="border-b border-border bg-muted/20 shrink-0">
                  <Tabs
                    value={activeFileId || ""}
                    onValueChange={setActiveFileId}
                  >
                    <div className="flex items-end gap-0 px-1">
                      <TabsList className="h-9 bg-transparent p-0 gap-0 rounded-none border-0">
                        {openFiles.map((file) => (
                          <TabsTrigger
                            key={file.id}
                            value={file.id}
                            className="relative h-9 px-4 rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:shadow-none bg-muted/30 data-[state=inactive]:bg-transparent group"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              <span>
                                {file.filename}.{file.fileExtension}
                              </span>
                              {file.hasUnsavedChanges && (
                                <span className="h-2 w-2 rounded-full bg-orange-500" />
                              )}
                              <span
                                className="ml-2 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closeFile(file.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {openFiles.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={closeAllFiles}
                          className="h-6 px-2 text-xs"
                        >
                          Close All
                        </Button>
                      )}
                    </div>
                  </Tabs>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "32px",
                    padding: "0 16px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "12px",
                    color: "var(--foreground-tertiary)",
                  }}
                >
                  <span>
                    {activeFile
                      ? `${activeFile.filename}.${activeFile.fileExtension}`
                      : ""}
                  </span>
                  <RAGContextChip chunks={aiSuggestions.ragChunks} />
                </div>
                <div className="flex-1">
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full"
                  >
                    <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                      <PlaygroundEditor
                        activeFile={activeFile}
                        content={activeFile?.content || ""}
                        onContentChange={(value) => 
                          activeFileId && updateFileContent(activeFileId , value)
                        }
                        suggestion={aiSuggestions.suggestion}
                        suggestionLoading={aiSuggestions.isLoading}
                        suggestionPosition={aiSuggestions.position}
                        onAcceptSuggestion={(editor , monaco)=>aiSuggestions.acceptSuggestion(editor , monaco)}

                          onRejectSuggestion={(editor) =>
                          aiSuggestions.rejectSuggestion(editor)
                        }
                        onTriggerSuggestion={(type, editor) =>
                          aiSuggestions.fetchSuggestion(type, editor, {
                            fileName: activeFile ? `${activeFile.filename}.${activeFile.fileExtension}` : undefined,
                          })
                        }
                        onCursorChange={(line, column) =>
                          setCursorPosition({ line, column })
                        }
                      />
                    </ResizablePanel>

                    {isPreviewVisible && (
                      <>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={50}>
                          <WebContainerPreview
                            templateData={templateData}
                            instance={instance}
                            writeFileSync={writeFileSync}
                            isLoading={containerLoading}
                            error={containerError}
                            serverUrl={serverUrl!}
                            forceResetup={false}
                          />
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                </div>
                <StatusBar
                  line={cursorPosition.line}
                  column={cursorPosition.column}
                  language={activeFile ? `${activeFile.filename}.${activeFile.fileExtension}` : ""}
                  isAIGenerating={aiSuggestions.isLoading}
                />
              </div>
            ) : (
              <PlaygroundNoFilesView />
            )}
          </div>
        </SidebarInset>
      </div>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;
