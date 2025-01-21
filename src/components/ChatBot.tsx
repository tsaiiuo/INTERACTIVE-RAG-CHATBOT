"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";

export default function ChatBot() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [remainingMessages, setRemainingMessages] = useState<number>(20);
  const [error, setError] = useState<string>("");

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
  } = useChat({
    api: "/api/chat",
    maxSteps: 3,
    onError: (error) => {
      console.error("Chat error:", error);
      // if (error?.message?.includes("429")) {
      //   setError("今日訊息次數已達上限，請明天再試。");
      // }
    },
  });

  // 自定義 handleSubmit 來處理錯誤
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (remainingMessages <= 0) {
      setError("今日訊息次數已達上限，請明天再試。");
      return;
    }
    setError(""); // 清除之前的錯誤訊息
    originalHandleSubmit(e);
  };

  // 添加一個格式化文字的函數
  const formatMessage = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        // 處理粗體文字
        const formattedLine = line.replace(
          /\*\*(.*?)\*\*/g,
          "<strong>$1</strong>"
        );
        return `<span key=${i}>${formattedLine}</span>`;
      })
      .join("<br />");
  };

  // 滾動到底部的函數
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 當消息更新時滾動到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkRemaining = async () => {
      try {
        const response = await fetch("/api/chat");
        if (response.ok) {
          const data = await response.json();
          setRemainingMessages(data.remaining);
          if (data.remaining <= 0) {
            setError("今日訊息次數已達上限，請明天再試。");
          }
        }
      } catch (error) {
        console.error("Failed to fetch remaining messages:", error);
      }
    };

    checkRemaining();
  }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div>
              {message.content.length > 0 ? (
                <div
                  className={`max-w-[100%] rounded-lg p-3 ${
                    message.role === "assistant"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-500 text-white"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: message.content,
                  }}
                />
              ) : (
                <span className="italic font-light">
                  {"calling tool: " + message?.toolInvocations?.[0].toolName}
                </span>
              )}
            </div>
            {/* <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
              dangerouslySetInnerHTML={{
                __html: formatMessage(message.content),
              }}
            /> */}
          </div>
        ))}
        {/* {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <span className="animate-pulse text-gray-800">
                {"calling tool: " +
                  messages[messages.length - 1]?.toolInvocations?.[0].toolName}
              </span>
            </div>
            <div ref={messagesEndRef} />
          </div>
        )} */}
      </div>

      <div className="p-4 border-t">
        {error && (
          <div className="text-red-500 mb-2 text-center font-medium">
            {error}
          </div>
        )}
        <div className="text-sm text-gray-500 mb-2">
          今日剩餘訊息次數: {remainingMessages}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="輸入您的問題..."
            className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            disabled={remainingMessages <= 0}
          />
          <button
            type="submit"
            disabled={isLoading || remainingMessages <= 0}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            發送
          </button>
        </form>
      </div>
    </div>
  );
}
