"use server";

import { cookies } from "next/headers";

export async function adminLoginAction(email: string, password: string) {
  // 1. Log to verify environment variables
  console.log("Checking ENV variables: Email is", process.env.ADMIN_EMAIL ? "Set" : "Missing");

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    return {
      success: false,
      error: "Server missing ENV credentials. Check .env.local file.",
    };
  }

  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (email !== validEmail || password !== validPassword) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  // 2. Set the secure cookie upon successful validation
  const cookieStore = await cookies();
  cookieStore.set("admin_token", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return {
    success: true,
    user: { id: "admin", name: "Ethoss Admin", email, role: "admin" },
  };
}
