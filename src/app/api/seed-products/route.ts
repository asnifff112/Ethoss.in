import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();
    console.log("[SEED-PRODUCTS] Restoring original Beads Collection...");

    // Wipe all existing products
    await Product.deleteMany({});
    console.log("[SEED-PRODUCTS] Cleared all existing products.");

    const beadsCollection = [
      {
        name: "Lave bead",
        caption: "A vibrant beaded bracelet designed in a deep purple and soft tone Lightweight, stretchable ,unisex and goes with everything",
        original_price: 149,
        price: 99,
        delivery_charge: 39,
        category_id: "earthbound-soul",
        images: [
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777968719/ethoss-products/jfs9lj00iqhc4kuauk65.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777968729/ethoss-products/tnqwv0oebisrfbve9njk.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777968739/ethoss-products/dasba9b77khicum6zzlv.jpg"
        ],
        is_sold_out: false,
      },
      {
        name: "Crimson Flare Bead",
        caption: "A striking beaded bracelet designed in a bold crimson red and iridescent tone. Lightweight, stretchable, unisex and goes with everything.",
        original_price: 149,
        price: 99,
        delivery_charge: 39,
        category_id: "earthbound-soul",
        images: [
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777970158/ethoss-products/yt6saacz4971jsvx9ijp.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777970182/ethoss-products/cryzxpz25tmq3czvhums.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777970194/ethoss-products/rmasrjnro3roa0c4xms5.jpg"
        ],
        is_sold_out: false,
      },
      {
        name: "Lagoon bead",
        caption: "A fresh beaded bracelet designed in a calm lagoon blue and soft tone.\nLightweight, stretchable, unisex and goes with everything .",
        original_price: 149,
        price: 99,
        delivery_charge: 39,
        category_id: "earthbound-soul",
        images: [
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777970592/ethoss-products/uuwflsa1n5iqbnpcznzv.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777970602/ethoss-products/rfxdzzj263fkngxruunb.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1777970612/ethoss-products/b6l5cgin9wu5uc0mfvfc.jpg"
        ],
        is_sold_out: false,
      },
      {
        name: "Obsidian pulse",
        caption: "A bold beaded bracelet crafted with deep black tones and polished chrome accents.\nMinimal, stretchable, unisex and designed for a sleek everyday look.",
        original_price: 149,
        price: 99,
        delivery_charge: 39,
        category_id: "earthbound-soul",
        images: [
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1778144954/ethoss-products/stp9zmk2jdkokkeugmit.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1778144963/ethoss-products/osk1vwcsc03usr6yfymi.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1778144970/ethoss-products/vpgdthryx3snz8xbos3m.jpg"
        ],
        is_sold_out: false,
      },
      {
        name: "Midnight bead",
        caption: "A sleek beaded bracelet crafted in a deep midnight blue tone.\nLightweight, stretchable, unisex and goes with everything .",
        original_price: 149,
        price: 99,
        delivery_charge: 39,
        category_id: "earthbound-soul",
        images: [
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1778145112/ethoss-products/s02qry6mnr0wzypyvxrw.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1778145123/ethoss-products/afqhtchhtw1ahrdllzul.jpg",
          "https://res.cloudinary.com/dwwktwox5/image/upload/v1778145132/ethoss-products/rkr7ba5tv7v2ikskqois.jpg"
        ],
        is_sold_out: false,
      },
    ];

    const created = await Product.insertMany(beadsCollection);
    console.log(`[SEED-PRODUCTS] Restored ${created.length} beads.`);

    return NextResponse.json({
      message: `Beads Collection restored — ${created.length} products`,
      products: created.map((p) => ({ name: p.name, price: p.price, images: p.images.length })),
    }, { status: 201 });
  } catch (error: any) {
    console.error("[SEED-PRODUCTS] Error:", error.message);
    return NextResponse.json({ message: "Seeding failed", error: error.message }, { status: 500 });
  }
}
