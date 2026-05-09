import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

// GET /api/products/[id] — fetch specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// PATCH /api/products/[id] — update specific fields (e.g. toggle sold out status)
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

    await connectToDatabase();

    // Apply explicit field updates (only allow safe fields)
    const allowedFields = ["is_sold_out", "price", "original_price", "delivery_charge", "caption"];
    const safeUpdates: any = {};
    
    for (const field of allowedFields) {
      if (field in updates) {
        safeUpdates[field] = updates[field];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: safeUpdates },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { message: `Product with id '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product updated successfully", product: updatedProduct },
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
