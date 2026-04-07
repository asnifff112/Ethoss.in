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

// PATCH /api/products/[id] — update product fields (e.g. stock sync)
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

    // Special: decrementBy — subtract purchased quantity from current stock
    if (typeof updates.decrementBy === "number" && updates.decrementBy > 0) {
      const currentStock: number = db.products[productIndex].stock ?? 0;
      const newStock = Math.max(0, currentStock - updates.decrementBy);
      db.products[productIndex].stock = newStock;

      // Auto-set availability flags based on new stock level
      if (newStock === 0) {
        db.products[productIndex].isAvailable = false;
        db.products[productIndex].showLowStock = false;
      } else if (newStock <= 3) {
        db.products[productIndex].isAvailable = true;
        db.products[productIndex].showLowStock = true;
      } else {
        db.products[productIndex].isAvailable = true;
        db.products[productIndex].showLowStock = false;
      }
    } else {
      // Apply explicit field updates (only allow safe fields)
      const allowedFields = ["isAvailable", "stock", "showLowStock"];
      for (const field of allowedFields) {
        if (field in updates) {
          db.products[productIndex][field] = updates[field];
        }
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
