import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

async function readDb() {
  const file = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(file);
}

async function writeDb(data: unknown) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// GET /api/orders/user/[userId] — fetch orders for a specific user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await readDb();
    const orders = (db.orders || []).filter(
      (order: { userId?: string }) => order.userId === userId
    );

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders/user error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
