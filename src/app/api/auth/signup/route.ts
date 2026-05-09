import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    console.log(`[SIGNUP] Attempt for: ${email}`);

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please provide all required fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log("[SIGNUP] MongoDB connected.");

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[SIGNUP] User already exists: ${email}`);
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`[SIGNUP] Password hashed for: ${email}`);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
      isBlocked: false,
      wishlist: [],
    });

    console.log(`[SIGNUP] User created successfully: ${newUser.email}, ID: ${newUser._id}`);

    return NextResponse.json(
      { message: "Account created successfully!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[SIGNUP] Error:", error.message, error.stack);
    return NextResponse.json(
      { message: "Registration failed. Please try again.", details: error.message },
      { status: 500 }
    );
  }
}
