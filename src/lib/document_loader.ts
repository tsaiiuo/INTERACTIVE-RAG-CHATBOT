import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class DocumentLoader {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  async processText(text: string): Promise<Document[]> {
    const docs = await this.textSplitter.createDocuments([text]);
    return docs;
  }
}
