// migrate.ts
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const match = envContent.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = match ? match[1].trim() : process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    caption: { type: String, required: true },
    original_price: { type: Number, required: true },
    price: { type: Number, required: true },
    delivery_charge: { type: Number, required: true },
    category_id: { type: String, required: true },
    images: { type: [String], default: [] },
    is_sold_out: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const dbPath = path.join(__dirname, "src", "data", "db.json");
    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

    const products = dbData.products;
    
    if (!products || products.length === 0) {
      console.log("No products found in db.json.");
      process.exit(0);
    }

    console.log(`Found ${products.length} products. Migrating...`);

    // Only insert if collection is empty to prevent duplicates on rerun
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`MongoDB already has ${existingCount} products. Skipping migration to prevent duplicates.`);
    } else {
      for (const p of products) {
        // Create new without old string ID
        await Product.create({
          name: p.name,
          caption: p.caption,
          original_price: p.original_price,
          price: p.price,
          delivery_charge: p.delivery_charge,
          category_id: p.category_id,
          images: p.images,
          is_sold_out: p.is_sold_out
        });
      }
      console.log("Migration successful!");
    }

  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
