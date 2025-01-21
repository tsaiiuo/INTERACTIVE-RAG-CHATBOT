import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [contents] = await db.query<RowDataPacket[]>(
      "SELECT id, content, created_at FROM vector_store ORDER BY created_at DESC"
    );

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Error fetching vector store contents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
