import { NextResponse } from "next/server";

// POST /api/admin/auth — Verify admin credentials (server-side only)
// ADMIN_EMAIL and ADMIN_PASSWORD are server-only env vars (no NEXT_PUBLIC_ prefix)
// so they are NEVER sent to the browser.

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const validEmail = process.env.ADMIN_EMAIL;
    const validPassword = process.env.ADMIN_PASSWORD;

    // Temporary Debugging Logs
    console.log("Input Email:", email, "ENV ADMIN_EMAIL:", validEmail);
    console.log("Input Password:", password, "ENV ADMIN_PASSWORD:", validPassword);

    if (!validEmail || !validPassword) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables.");
      return NextResponse.json(
        { message: "Server configuration error." },
        { status: 500 }
      );
    }

    if (email === validEmail && password === validPassword) {
      // Set the authentication state/cookie upon success
      const response = NextResponse.json(
        {
          success: true,
          user: { id: "admin", name: "Ethoss Admin", email, role: "admin" },
        },
        { status: 200 }
      );

      response.cookies.set("admin_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return response;
    }

    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { message: "Authentication failed." },
      { status: 500 }
    );
  }
}
