"use client";

import ChatBot from "@/components/ChatBot";
import { useState, useEffect } from "react";
import { Cursor, useTypewriter } from "react-simple-typewriter";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface VectorContent {
  id: number;
  content: string;
  created_at: string;
}

interface RuleContent {
  id: number;
  rule: string;
}

export default function IntroPage() {
  const [vectorContents, setVectorContents] = useState<VectorContent[]>([]);
  const [ruleContents, setRuleContents] = useState<RuleContent[]>([
    {
      id: 1,
      rule: "如果用戶詢問rag-database相關的內容，那麼聊天機器人應該回覆該資訊。",
    },
    {
      id: 2,
      rule: "If the user asks about the rag-database, then the chatbot should respond with the database information.",
    },
    {
      id: 3,
      rule: "如果用戶想要新增rag-database相關的內容，那麼在input前輸入[將以下資訊新增到你的知識庫中：]，然後輸入你要新增的內容。",
    },
    {
      id: 4,
      rule: "If the user wants to add content related to rag-database, then input [Add the following information to your knowledge base:] before the input, and then input the content you want to add.",
    },
  ]);
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

  const [isKnowledgeBaseVisible, setKnowledgeBaseVisible] = useState(false);
  const [isRuleBaseVisible, setRuleBaseVisible] = useState(true);

  const toggleKnowledgeBase = () => {
    if (isRuleBaseVisible) {
      setRuleBaseVisible(false);
    }
    setKnowledgeBaseVisible((prev) => !prev);
  };

  const toggleRuleBase = () => {
    if (isKnowledgeBaseVisible) {
      setKnowledgeBaseVisible(false);
    }
    setRuleBaseVisible((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 標題區域 */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 lg:mb-8 text-center">
          <span>{text}</span>
          <Cursor cursorColor="#F7AB0A" />
        </h1>

        {/* 主要內容區域 */}
        <div className="flex flex-col md:flex-row gap-6 ">
          {/* 聊天機器人區域 */}
          <div className="w-full md:w-2/3">
            <ChatBot />
          </div>

          {/* 知識庫列表區域 */}
          <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 md:p-4 border-b">
              <h2 className="text-lg md:text-xl font-bold">
                Interact-RAG-CHATBOT規則
              </h2>
              <button
                onClick={toggleRuleBase}
                className="text-gray-500 hover:text-gray-700"
              >
                {isRuleBaseVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {isRuleBaseVisible && (
              <div className="overflow-y-auto p-3 md:p-4 space-y-3 max-h-[300px] md:max-h-[500px]">
                {ruleContents.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-xs md:text-sm text-gray-800">
                      {item.rule}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center p-3 md:p-4 border-b">
              <h2 className="text-lg md:text-xl font-bold">
                RAG-CHATBOT知識庫內容
              </h2>
              <button
                onClick={toggleKnowledgeBase}
                className="text-gray-500 hover:text-gray-700"
              >
                {isKnowledgeBaseVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {isKnowledgeBaseVisible && (
              <div className="overflow-y-auto p-3 md:p-4 space-y-3 max-h-[300px] md:max-h-[500px]">
                {vectorContents.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-xs md:text-sm text-gray-800">
                      {item.content}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
