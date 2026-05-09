import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 });
    console.log(`[PRODUCTS API] Fetched ${products.length} products from DB.`);
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("[PRODUCTS API] Error:", error.message);
    return NextResponse.json({ message: "Failed to fetch products", error: error.message }, { status: 500 });
  }
}
