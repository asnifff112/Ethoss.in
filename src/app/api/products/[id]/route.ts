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

// PATCH /api/products/[id] — toggle sold out status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const db = await readDb();
    if (!db.products) {
      return NextResponse.json(
        { message: "Products not found in database" },
        { status: 404 }
      );
    }

    const productIndex = db.products.findIndex(
      (p: { id: string }) => p.id === id
    );

    if (productIndex === -1) {
      return NextResponse.json(
        { message: `Product with id '${id}' not found` },
        { status: 404 }
      );
    }

    // Apply explicit field updates (only allow safe fields)
    const allowedFields = ["is_sold_out", "price", "original_price", "delivery_charge", "caption"];
    for (const field of allowedFields) {
      if (field in updates) {
        db.products[productIndex][field] = updates[field];
      }
    }

    await writeDb(db);

    return NextResponse.json(
      { message: "Product updated", product: db.products[productIndex] },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
