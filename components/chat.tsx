"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
// import { ChatLine } from "./chat-line";
// import { useChat, Message } from "ai-stream-experimental/react";
import { useChat, Message } from "ai/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// import { Spinner } from "./ui/spinner";
import { use, useEffect, useRef, useState } from "react";
import { ChatLine } from "./chat-line";
import { Loader2Icon } from "lucide-react";

export function Chat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"default" | "personal">("personal");
  const [storedMessages, setStoredMessages] = useState<Message[] | null>(null);
  const [isClientReady, setIsClientReady] = useState(false); // טוען הודעות מה-localStorage רק בצד הלקוח
  // נטען רק בצד הלקוח
  useEffect(() => {
    try {
      const itemStr = localStorage.getItem("chatMessages");
      if (itemStr) {
        const { messages, timestamp } = JSON.parse(itemStr);
        const age = Date.now() - timestamp;
        if (age < 1 * 60 * 1000) {
          setStoredMessages(messages);
        } else {
          localStorage.removeItem("chatMessages");
          setStoredMessages(initialMessages);
        }
      } else {
        setStoredMessages(initialMessages);
      }
    } catch (err) {
      console.error("שגיאה בטעינת localStorage:", err);
      setStoredMessages(initialMessages);
    }

    setIsClientReady(true);
  }, []);

  // if (!isClientReady || storedMessages === null) {
  //   return (
  //     <div className="p-6 text-center text-sm text-gray-500">טוען שיחה...</div>
  //   );
  // }

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      initialMessages: storedMessages ?? [],
      body: { mode },
    });

  // גלילה לתחתית ברגע שיש הודעות
  useEffect(() => {
    scrollToBottom(containerRef);
  }, [messages]);

  useEffect(() => {
    if (!isClientReady || messages.length === 0) return;

    localStorage.setItem(
      "chatMessages",
      JSON.stringify({ messages, timestamp: Date.now() })
    );
  }, [messages, isClientReady]);

  if (!storedMessages) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">טוען שיחה...</div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      dir="rtl"
      className="rounded-2xl border h-[75vh] flex flex-col justify-between"
    >
      <div className="p-4 flex justify-between items-center">
        <label className="text-sm mr-2">בחר סוג סוכן: 🤖</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "default" | "personal")}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none px-4 py-2 shadow-sm transition-all"
        >
          <option value="default">סוכן כללי 🧠</option>
          <option value="personal">סוכן אישי 💼</option>
        </select>
      </div>
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
