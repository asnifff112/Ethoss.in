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
      // Update existing user to ADMIN
      user.role = "ADMIN";
      user.password = hashedPassword;
      
      await user.save();
      return NextResponse.json({ message: `Admin user updated. Password is set to '${passwordRaw}'.` }, { status: 200 });
    } else {
      // Create new ADMIN user
      user = await User.create({
        name: "Ethoss Admin",
        email,
        password: hashedPassword,
        role: "ADMIN"
      });
      return NextResponse.json({ message: `Admin user created. Password is '${passwordRaw}'.` }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error seeding admin", error }, { status: 500 });
  }
}
