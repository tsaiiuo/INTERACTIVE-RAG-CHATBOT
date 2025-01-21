import { db } from "./db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const DAILY_LIMIT = 20;

export async function checkIPLimit(ip: string): Promise<boolean> {
  try {
    // 獲取當前 IP 的使用記錄
    const [records] = await db.query<RowDataPacket[]>(
      "SELECT * FROM ip_usage WHERE ip_address = ?",
      [ip]
    );

    const now = new Date();
    interface IPUsageRecord extends RowDataPacket {
      ip_address: string;
      usage_count: number;
      last_reset: string;
    }
    const record = records[0] as IPUsageRecord;

    if (!record) {
      // 新 IP，創建記錄
      await db.query<ResultSetHeader>(
        "INSERT INTO ip_usage (ip_address) VALUES (?)",
        [ip]
      );
      return true;
    }

    const lastReset = new Date(record.last_reset);
    const needsReset =
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (needsReset) {
      // 重置計數器
      await db.query(
        "UPDATE ip_usage SET usage_count = 1, last_reset = NOW() WHERE ip_address = ?",
        [ip]
      );
      return true;
    }

    if (record.usage_count >= DAILY_LIMIT) {
      return false;
    }

    // 增加使用次數
    await db.query(
      "UPDATE ip_usage SET usage_count = usage_count + 1 WHERE ip_address = ?",
      [ip]
    );
    return true;
  } catch (error) {
    console.error("Error checking IP limit:", error);
    return false;
  }
}

export async function getRemainingMessages(ip: string): Promise<number> {
  try {
    const [records] = await db.query<RowDataPacket[]>(
      "SELECT usage_count FROM ip_usage WHERE ip_address = ?",
      [ip]
    );

    if (!records[0]) {
      return DAILY_LIMIT;
    }
    interface IPUsageRecord extends RowDataPacket {
      ip_address: string;
      usage_count: number;
      last_reset: string;
    }
    const record = records[0] as IPUsageRecord;

    return Math.max(0, DAILY_LIMIT - record.usage_count);
  } catch (error) {
    console.error("Error getting remaining messages:", error);
    return 0;
  }
}
