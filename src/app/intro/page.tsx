"use client";

import ChatBot from "@/components/ChatBot";
import { useState, useEffect } from "react";
import { Cursor, useTypewriter } from "react-simple-typewriter";

interface VectorContent {
  id: number;
  content: string;
  created_at: string;
}

export default function IntroPage() {
  const [vectorContents, setVectorContents] = useState<VectorContent[]>([]);

  const [text] = useTypewriter({
    words: [
      "Welcome to IanTsai's RAG-CHATBOT prototype",
      "Ask me anything about Database",
      "I'm here to help",
    ],
    loop: true,
    delaySpeed: 1500,
  });

  useEffect(() => {
    const fetchVectorContents = async () => {
      try {
        const response = await fetch("/api/vector-store");
        if (response.ok) {
          const data = await response.json();
          setVectorContents(data);
        }
      } catch (error) {
        console.error("Failed to fetch vector contents:", error);
      }
    };

    fetchVectorContents();
  }, []);

  return (
    <div className="min-h-screen h-screen bg-background flex overflow-hidden">
      {/* 左側聊天區域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span>{text}</span>
          <Cursor cursorColor="#F7AB0A" />
        </h1>
        <div className="w-full max-w-3xl">
          <ChatBot />
        </div>
      </div>

      {/* 右側知識庫列表 */}
      <div className="w-80 h-80 bg-white shadow-lg flex flex-col  my-8 mr-4 rounded-lg">
        <h2 className="text-xl font-bold p-4 border-b">
          RAG-CHATBOT知識庫內容
        </h2>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-4 mb-4">
            {vectorContents.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm text-gray-800">{item.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
