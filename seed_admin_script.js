require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not found in .env.local");
    
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.useDb("test"); // Assuming default db or parsed from URI
    const User = db.collection("users");

    const email = "ethoss.in@gmail.com";
    const passwordRaw = "asnifnafila";
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordRaw, salt);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      await User.updateOne(
        { email },
        { 
          $set: { 
            role: "ADMIN", 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );
      console.log(`Successfully updated existing user ${email} to ADMIN with new hashed password.`);
    } else {
      await User.insertOne({
        name: "Ethoss Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
        isBlocked: false,
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Successfully created new ADMIN user ${email}.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedAdmin();
