import { NextRequest, NextResponse } from "next/server";
import { Message, streamText } from "ai";
import { LangChainAdapter } from "ai";
import { getVectorStore } from "@/lib/vector-store";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { processUserMessage } from "@/lib/langchain";
import { getPineconeClient } from "@/lib/pinecone-client";
import { runPersonalAgent } from "@/lib/personal-agent"; // ✅ חדש
import { saveConversation } from "@/lib/save-conversation"; // ✅ חדש

// Allow streaming responses up to 30 seconds
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request
    const body = await req.json();
    const messages: Message[] = body.messages ?? [];
    const mode = body.mode ?? "default"; // ✅ חדש: בודק אם מצב אישי מופעל

    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }
    const currentQuestion = messages[messages.length - 1].content;
    if (!currentQuestion?.trim()) {
      return NextResponse.json(
        { error: "Empty question provided" },
        { status: 400 }
      );
    }

    // ✅ סוכן אישי – מבלי לגעת בקוד הקיים
    if (mode === "personal") {
      const pc = await getPineconeClient();
      const vectorStore = await getVectorStore(pc);
      const profile = (await vectorStore.similaritySearch("תן את כל המידע", 20))
        .map((doc) => doc.pageContent)
        .join("\n\n");

      const result = await runPersonalAgent({
        prompt: currentQuestion,
        profile,
      });

      // ✅ שומר ב-MongoDB
      await saveConversation(messages, mode);

      // ✅ עוטפים את הטקסט ב־ReadableStream ידני
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(result);
          controller.close();
        },
      });

      return LangChainAdapter.toDataStreamResponse(stream);
    }

    // Format conversation history
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(
        (message) =>
          `${message.role === "user" ? "Human" : "Assistant"}: ${
            message.content
          }`
      )
      .join("\n");

    // Initialize model and vector store
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.1,
      streaming: true,
    });
    const pc = await getPineconeClient();
    const vectorStore = await getVectorStore(pc);
    const parser = new StringOutputParser();
    const stream = await processUserMessage({
      userPrompt: currentQuestion,
      conversationHistory: formattedPreviousMessages,
      vectorStore,
      model,
    });

    // ✅ שומר גם במצב רגיל
    await saveConversation(messages, mode);

    console.log("message answer =>", stream);
    // console.log("message inquiry =>", inquiry);
    // Convert the stream using the new adapter
    const response = LangChainAdapter.toDataStreamResponse(stream);
    return response;
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
