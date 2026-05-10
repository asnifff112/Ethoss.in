import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    console.log("[MIGRATION] Starting targeted bulk update...");

    // 1. TARGETED UPDATE: Specific products to "The Knot Theory"
    const knotTheoryProducts = [
      "Crimson Flare Bead",
      "Lagoon Bead",
      "Obsidian Pulse",
      "Midnight Bead",
      "Lave Bead"
    ];

    const res1 = await Product.updateMany(
      { name: { $in: knotTheoryProducts } },
      { $set: { category_id: "The Knot Theory" } }
    );

    // 2. Generic Mapping for others to ensure they have the new EXACT category names
    
    // Volcanic Soul
    const res2 = await Product.updateMany(
      { 
        name: { $nin: knotTheoryProducts },
        $or: [
          { name: { $regex: /Volcanic/i } },
          { caption: { $regex: /Volcanic/i } }
        ]
      },
      { $set: { category_id: "Volcanic Soul" } }
    );

    // The Onyx Essence
    const res3 = await Product.updateMany(
      { 
        name: { $nin: knotTheoryProducts },
        $or: [
          { name: { $regex: /Onyx|Black/i } },
          { caption: { $regex: /Onyx|Black/i } }
        ]
      },
      { $set: { category_id: "The Onyx Essence" } }
    );

    // Duo Essence
    const res4 = await Product.updateMany(
      { 
        name: { $nin: knotTheoryProducts },
        $or: [
          { name: { $regex: /Duo|Pair|Combo/i } },
          { caption: { $regex: /Duo|Pair|Combo/i } }
        ]
      },
      { $set: { category_id: "Duo Essence" } }
    );

    // Final cleanup: Anything else that might have old IDs
    await Product.updateMany(
      { category_id: { $nin: ["The Knot Theory", "Volcanic Soul", "The Onyx Essence", "Duo Essence"] } },
      { $set: { category_id: "The Knot Theory" } }
    );

    console.log("[MIGRATION] Targeted update complete.");

    return NextResponse.json({ 
      message: "Data realigned successfully",
      stats: {
        knotTheoryTargeted: res1.modifiedCount,
        volcanicSoul: res2.modifiedCount,
        onyxEssence: res3.modifiedCount,
        duoEssence: res4.modifiedCount
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Error realigning data", error: error.message }, { status: 500 });
  }
}
