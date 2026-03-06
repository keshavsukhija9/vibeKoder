import { NextRequest, NextResponse } from "next/server";
import { getOllamaUrl, OLLAMA_GENERATE_PATH } from "@/lib/ollama";
import { jsonError, readJsonBody } from "@/lib/api-errors";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

const OLLAMA_HINT =
  "Ensure Ollama is running (ollama serve) and install a model: ollama pull codellama";

async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice  
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

  const prompt = fullMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  const url = getOllamaUrl(OLLAMA_GENERATE_PATH);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.VIBECODER_LLM_MODEL ?? "codellama:latest",
      prompt,
      stream: false,
      options: { temperature: 0.7, max_tokens: 1000, top_p: 0.9 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}. ${OLLAMA_HINT}`);
  }

  const data = (await response.json()) as { response?: string };
  if (!data.response) {
    throw new Error("No response from AI model");
  }
  return data.response.trim();
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await readJsonBody<ChatRequest>(req);
    if (parsed.errorResponse) return parsed.errorResponse;
    const body = parsed.body;
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return jsonError(400, "Message is required and must be a string");
    }

    // Validate history format
    const validHistory = Array.isArray(history)
      ? history.filter(
          (msg) =>
            msg &&
            typeof msg === "object" &&
            typeof msg.role === "string" &&
            typeof msg.content === "string" &&
            ["user", "assistant"].includes(msg.role)
        )
      : [];

    const recentHistory = validHistory.slice(-10);

    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: message },
    ];

    //   Generate ai response

    const aiResponse = await generateAIResponse(messages);



    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(500, "Failed to generate AI response", message);
  }
}
