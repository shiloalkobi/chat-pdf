"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
// import { ChatLine } from "./chat-line";
// import { useChat, Message } from "ai-stream-experimental/react";
import { useChat, Message } from "ai/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import { Spinner } from "./ui/spinner";
import { useEffect, useRef } from "react";
import { ChatLine } from "./chat-line";
import { Loader2Icon } from "lucide-react";

export function Chat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      api: "/api/chat",
      initialMessages,
      body: (messages: Message[]) => ({
        messages,
        mode: "personal", // ✅ זה מה שמפעיל את הסוכן האישי בצד שרת
      }),
    });

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);

  return (
    <div
      dir="rtl"
      className="rounded-2xl border h-[75vh] flex flex-col justify-between"
    >
      <div className="p-6 overflow-auto" ref={containerRef}>
        {messages.map(({ id, role, content }: Message, index) => (
          <ChatLine
            key={id}
            role={role}
            content={content}
            // Start from the third message of the assistant
            sources={[]}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex clear-both">
        <Input
          value={input}
          placeholder={"Type to chat with AI..."}
          onChange={handleInputChange}
          className="mr-2"
        />
        {isLoading ? (
          <Button size="sm" disabled>
            <Loader2Icon className="animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit" className="w-24">
            Ask
          </Button>
        )}
      </form>
    </div>
  );
}
