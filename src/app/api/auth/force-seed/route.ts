import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectToDatabase();
    const email = "ethoss.in@gmail.com";
    const passwordRaw = "asnifnafila";
    
    // Nuclear option: Delete existing user completely to avoid any lingering state/cache issues
    await User.deleteOne({ email });
    console.log(`[FORCE SEED] Deleted existing user (if any): ${email}`);

    // Create fresh user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordRaw, salt);
    
    const newUser = await User.create({
      name: "Ethoss Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
      isBlocked: false,
      wishlist: []
    });

    console.log(`[FORCE SEED] Successfully created new ADMIN user.`);

    return NextResponse.json({ 
      message: "NUCLEAR SEED SUCCESSFUL", 
      email: newUser.email, 
      role: newUser.role,
      action: "Deleted old and created fresh."
    }, { status: 201 });
  } catch (error) {
    console.error("[FORCE SEED] Error:", error);
    return NextResponse.json({ message: "Nuclear seed failed", error: String(error) }, { status: 500 });
  }
}
