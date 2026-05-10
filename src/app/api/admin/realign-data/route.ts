import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    console.log("[MIGRATION] Final targeted normalization of categories...");

    // 1. The Knot Theory (Targeted)
    const knotTheoryNames = [
      "Crimson Flare Bead",
      "Lagoon Bead",
      "Obsidian Pulse",
      "Midnight Bead",
      "Lave Bead"
    ];

    await Product.updateMany(
      { name: { $in: knotTheoryNames } },
      { $set: { category_id: "The Knot Theory" } }
    );

    // 2. Volcanic Soul
    await Product.updateMany(
      { 
        $and: [
          { name: { $regex: /Volcanic|Lave/i } },
          { name: { $nin: knotTheoryNames } }
        ]
      },
      { $set: { category_id: "Volcanic Soul" } }
    );

    // 3. The Onyx Essence
    await Product.updateMany(
      { 
        $and: [
          { name: { $regex: /Onyx|Black|Obsidian|Midnight/i } },
          { name: { $nin: knotTheoryNames } }
        ]
      },
      { $set: { category_id: "The Onyx Essence" } }
    );

    // 4. Duo Essence
    await Product.updateMany(
      { 
        $and: [
          { name: { $regex: /Duo|Combo|Pair|Lagoon/i } },
          { name: { $nin: knotTheoryNames } }
        ]
      },
      { $set: { category_id: "Duo Essence" } }
    );

    console.log("[MIGRATION] Complete.");

    return NextResponse.json({ message: "Data normalized successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Error normalizing data", error: error.message }, { status: 500 });
  }
}
