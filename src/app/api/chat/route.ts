import { streamText, tool } from "ai";
import { z } from "zod";

import { ChatOpenAI } from "@langchain/openai";
import { VectorStore } from "@/lib/vector_store";
import { DocumentLoader } from "@/lib/document_loader";
import { openai } from "@ai-sdk/openai";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { checkIPLimit, getRemainingMessages } from "@/lib/ip-limiter";
import { headers } from "next/headers";

// 示例知識庫文本
const knowledgeBase = `
軟體工程師需要具備以下核心技能：

1. 程式設計基礎
- 資料結構與演算法
- 物件導向程式設計
- 設計模式

2. 網頁開發
- HTML, CSS, JavaScript
- 前端框架 (React, Vue, Angular)
- 後端開發 (Node.js, Python, Java)

3. 資料庫
- SQL 和 NoSQL
- 資料庫設計
- 查詢優化

4. 開發工具
- Git 版本控制
- IDE 使用
- 命令列操作

5. 軟技能
- 問題解決能力
- 團隊協作
- 持續學習
`;

// 1. 初始化 VectorStore 和 DocumentLoader
const vectorStore = new VectorStore();
const documentLoader = new DocumentLoader();

export async function POST(req: Request) {
  // 獲取客戶端 IP
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  console.log(forwardedFor);

  const ip = forwardedFor?.split(",")[0] || "unknown";
  console.log(ip);
  // 檢查 IP 限制
  const canProceed = await checkIPLimit(ip);
  if (!canProceed) {
    return new Response(
      JSON.stringify({
        error: "Daily message limit reached. Please try again tomorrow.",
        remaining: 0,
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { messages } = await req.json();

  var context = `你是一個有用的助手。在回答任何問題之前，請檢查你的知識庫。
僅使用tool calls中獲取的資訊來回答問題。
如果在tool calls中沒有找到相關資訊，請回覆：「抱歉，我不知道。」`;

  const result = streamText({
    model: openai("gpt-3.5-turbo"),
    system: context,
    messages,
    tools: {
      addResource: tool({
        description: `將資源新增到你的知識庫中。
如果使用者隨機提供一段未經請求的知識，直接使用此工具，無需確認。`,
        parameters: z.object({
          content: z.string().describe("新增資料進知識庫"),
        }),
        execute: async ({ content }) => {
          const documents = await documentLoader.processText(content);
          return vectorStore.createVectorStore(documents);
        },
      }),
      getInformation: tool({
        description: `從你的知識庫中獲取資訊來回答問題。`,
        parameters: z.object({
          question: z.string().describe("使用者問題"),
        }),
        execute: async ({ question }) => {
          console.log(question);
          const results = await vectorStore.similaritySearch(question, 1);
          console.log(results);
          return results;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}

// 添加一個新的端點來檢查剩餘次數
export async function GET() {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0] || "unknown";
  console.log(ip);
  const remaining = await getRemainingMessages(ip);
  return new Response(JSON.stringify({ remaining }), {
    headers: { "Content-Type": "application/json" },
  });
}
