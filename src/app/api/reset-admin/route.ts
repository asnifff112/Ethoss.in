import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectToDatabase();
    const email = "ethoss.in@gmail.com";
    const passwordRaw = "asnifnafila";
    
    // Check if user exists
    let user = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordRaw, salt);
    
    if (user) {
      user.role = "ADMIN";
      user.password = hashedPassword;
      await user.save();
      
      return NextResponse.json({ 
        message: "Admin password FORCE RESET successfully.", 
        email, 
        role: user.role 
      }, { status: 200 });
    } else {
      user = await User.create({
        name: "Ethoss Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
        isBlocked: false,
        wishlist: []
      });
      return NextResponse.json({ 
        message: "Admin user FORCE CREATED successfully.", 
        email, 
        role: user.role 
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Reset Admin Error:", error);
    return NextResponse.json({ message: "Error resetting admin", error: String(error) }, { status: 500 });
  }
}
