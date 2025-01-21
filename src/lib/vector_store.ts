import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { db } from "./db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class VectorStore {
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createVectorStore(documents: Document[]) {
    try {
      for (const doc of documents) {
        const embedding = await this.embeddings.embedQuery(doc.pageContent);

        await db.query<ResultSetHeader>(
          `INSERT INTO vector_store 
           (content, embedding, metadata, chunk_size, chunk_overlap, model_name) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            doc.pageContent,
            JSON.stringify(embedding),
            JSON.stringify(doc.metadata),
            1000, // chunk_size
            200, // chunk_overlap
            "text-embedding-ada-002",
          ]
        );
      }
      return true;
    } catch (error) {
      console.error("Error creating vector store:", error);
      return false;
    }
  }

  async similaritySearch(query: string, k: number = 3) {
    try {
      // 1. 獲取查詢文本的嵌入向量
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // 2. 從數據庫獲取所有向量
      const [vectors] = await db.query<RowDataPacket[]>(
        "SELECT * FROM vector_store"
      );

      // 3. 計算相似度並排序
      const similarities = vectors
        .map((vector) => ({
          ...vector,
          similarity: this.cosineSimilarity(queryEmbedding, vector.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity);

      // 4. 返回前 k 個最相似的文檔
      return similarities.slice(0, k).map((result) => ({
        content: result.content,
        similarity: result.similarity,
        role: "assistant",
      }));
    } catch (error) {
      console.error("Error in similarity search:", error);
      return [];
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
