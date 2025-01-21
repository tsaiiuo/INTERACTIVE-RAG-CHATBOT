# RAG-CHATBOT

An intelligent Q&A system based on RAG (Retrieval-Augmented Generation) technology, focusing on database knowledge retrieval and conversation. This system combines vector retrieval and large language models to provide accurate and relevant answers.

一個基於 RAG（Retrieval-Augmented Generation）技術的智能問答系統，專注於資料庫知識的檢索與對話。本系統結合了向量檢索和大型語言模型，提供準確且相關的回答。

## 系統特點

### 核心功能

- **智能檢索**：使用向量相似度搜索，確保回答的相關性
- **即時對話**：基於 OpenAI GPT-3.5 的流式回應
- **知識庫管理**：支援動態添加和更新知識
- **使用限制**：IP 位址每日限制 20 次請求
- **即時統計**：顯示剩餘可用次數
- **自動重置**：每日自動重置使用次數

### 使用者介面

- **雙面板設計**
  - 左側：對話介面
  - 右側：即時知識庫內容展示
- **響應式布局**：適配不同螢幕尺寸
- **動態效果**：打字機風格的歡迎訊息
- **狀態提示**：清晰的使用次數和錯誤提示

## 技術棧

### 前端

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TypeScript
- AI SDK

### 後端

- Node.js
- MySQL (向量儲存)
- OpenAI API
- LangChain

## 快速開始

### 環境要求

- Node.js 18+
- MySQL 8.0+
- OpenAI API Key

### 安裝步驟

1. Clone the project

```bash
git clone https://github.com/yourusername/rag-chatbot.git
cd rag-chatbot
```

2. Install dependencies

```bash
npm install
```

3. Environment setup
   創建 `.env.local` 文件：

```env
OPENAI_API_KEY=your_openai_api_key
MYSQL_HOST=your_mysql_host
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=rag_chatbox
```

4. Database setup

```sql
-- 創建向量儲存表
CREATE TABLE vector_store (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    embedding JSON NOT NULL,
    metadata JSON,
    chunk_size INT NOT NULL,
    chunk_overlap INT NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created (created_at)
);

-- 創建 IP 使用記錄表
CREATE TABLE ip_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    usage_count INT DEFAULT 1,
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip (ip_address),
    INDEX idx_reset (last_reset)
);
```

5. Run the project

```bash
npm run dev
```

## API 文檔

### 對話 API

```typescript
POST /api/chat
Content-Type: application/json

{
  "messages": Message[]
}
```

### RAG 知識庫 API

```typescript
GET /api/vector-store
Response: VectorContent[]
```

## 系統架構

```
Client (Next.js) <-> API Routes <-> OpenAI API
                              <-> MySQL Vector Store
```

## 部署

本專案可以部署到任何支援 Node.js 的平台：

1. Vercel（推薦）

```bash
vercel
```

2. 自託管

```bash
npm run build
npm run start
```

## 開發指南

### 目錄結構

```
src/
├── app/              # Next.js 應用程式
├── components/       # React 元件
├── lib/             # 工具函數和類別
└── types/           # TypeScript 型別定義
```

### 主要元件

- `ChatBot.tsx`: 對話介面
- `vector_store.ts`: 向量儲存實現
- `ip-limiter.ts`: IP 限制邏輯

## 安全性考慮

- API 請求限制
- SQL 注入防護
- 環境變數保護
- 向量儲存安全

## 效能優化

- 資料庫連接池
- 流式回應
- 動態載入

## 後續優化

- 向量檢索快取

## 作者

Ian Tsai
