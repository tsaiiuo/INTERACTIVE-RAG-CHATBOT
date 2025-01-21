import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// GET: 獲取用戶資料
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [session.user.email]
    );

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: 創建或更新用戶資料
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name, image } = session.user;
    const googleId = session.user.id; // 從 Google OAuth 獲取的 ID

    // 使用 INSERT ... ON DUPLICATE KEY UPDATE 來處理創建和更新
    const result = await db.query<ResultSetHeader>(
      `INSERT INTO users (google_id, name, email) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name)`,
      [googleId, name, email]
    );

    return NextResponse.json({ success: true, userId: result });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
