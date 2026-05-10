import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Update Obsidian/Midnight to Onyx Essence
    await Product.updateMany(
      { name: { $regex: /Obsidian|Midnight|Onyx/i } },
      { $set: { category_id: "onyx-essence" } }
    );

    // 2. Update Lava to Volcanic Soul
    await Product.updateMany(
      { name: { $regex: /Lave|Volcanic|Flare/i } },
      { $set: { category_id: "volcanic-soul" } }
    );

    // 3. Update Knot/Woven to Knot Theory
    await Product.updateMany(
      { name: { $regex: /Knot|Woven|Theory/i } },
      { $set: { category_id: "knot-theory" } }
    );

    // 4. Update Duo/Combo to Duo Essence
    await Product.updateMany(
      { name: { $regex: /Duo|Combo|Pair|Lagoon/i } },
      { $set: { category_id: "duo-essence" } }
    );

    // Final fallback for anything still under old category
    await Product.updateMany(
      { category_id: "earthbound-soul" },
      { $set: { category_id: "onyx-essence" } }
    );

    return NextResponse.json({ message: "Data realigned successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Error realigning data", error: error.message }, { status: 500 });
  }
}
