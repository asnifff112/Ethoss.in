import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    console.log("[MIGRATION] Starting bulk update of categories...");

    // 1. The Knot Theory (Woven/Thread/Knot)
    const res1 = await Product.updateMany(
      { 
        $or: [
          { name: { $regex: /Knot|Woven|Theory|Thread|Bracelet/i } },
          { caption: { $regex: /Knot|Woven|Theory|Thread/i } }
        ]
      },
      { $set: { category_id: "knot-theory" } }
    );

    // 2. Volcanic Soul (Lava/Raw/Volcanic)
    const res2 = await Product.updateMany(
      { 
        $or: [
          { name: { $regex: /Lave|Volcanic|Flare|Fire|Raw/i } },
          { caption: { $regex: /Lava|Volcanic|Fire|Raw/i } }
        ]
      },
      { $set: { category_id: "volcanic-soul" } }
    );

    // 3. The Onyx Essence (Black/Obsidian/Midnight/Polished)
    const res3 = await Product.updateMany(
      { 
        $or: [
          { name: { $regex: /Obsidian|Midnight|Onyx|Black|Polished/i } },
          { caption: { $regex: /Obsidian|Midnight|Onyx|Black|Polished/i } }
        ]
      },
      { $set: { category_id: "onyx-essence" } }
    );

    // 4. Duo Essence (Duo/Pair/Combo/Lagoon)
    const res4 = await Product.updateMany(
      { 
        $or: [
          { name: { $regex: /Duo|Combo|Pair|Lagoon|Twin/i } },
          { caption: { $regex: /Duo|Combo|Pair|Twin/i } }
        ]
      },
      { $set: { category_id: "duo-essence" } }
    );

    // Final cleanup: Ensure no one is left in old categories
    await Product.updateMany(
      { category_id: { $nin: ["knot-theory", "volcanic-soul", "onyx-essence", "duo-essence"] } },
      { $set: { category_id: "knot-theory" } } // Default
    );

    console.log("[MIGRATION] Complete.");

    return NextResponse.json({ 
      message: "Data migrated successfully",
      stats: {
        knotTheory: res1.modifiedCount,
        volcanicSoul: res2.modifiedCount,
        onyxEssence: res3.modifiedCount,
        duoEssence: res4.modifiedCount
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Error migrating data", error: error.message }, { status: 500 });
  }
}
