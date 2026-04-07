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

// POST /api/orders — create new order
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    if (!orderData.id || !orderData.userId || !orderData.items) {
      return NextResponse.json(
        { message: "Missing required order fields: id, userId, items" },
        { status: 400 }
      );
    }

    const db = await readDb();
    if (!db.orders) db.orders = [];

    db.orders.push(orderData);
    await writeDb(db);

    return NextResponse.json(
      { message: "Order created successfully", order: orderData },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET /api/orders — fetch all orders (admin use)
export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.orders || [], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
