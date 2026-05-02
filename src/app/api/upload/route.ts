import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer → base64 data URI for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "ethoss-products",
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    });

    return NextResponse.json(
      { url: result.secure_url },
      { status: 200 }
    );
  } catch (error: any) {
    // Detailed error logging for debugging
    console.error("─── Cloudinary Upload Error ───");
    console.error("Message:", error?.message || "Unknown error");
    console.error("HTTP Code:", error?.http_code || "N/A");
    console.error("Full Error:", JSON.stringify(error, null, 2));

    // Return specific error messages based on error type
    let userMessage = "Upload failed. Please try again.";

    if (error?.http_code === 401 || error?.message?.includes("Invalid API")) {
      userMessage = "Cloudinary authentication failed. Check your API Key and Secret.";
    } else if (error?.http_code === 420) {
      userMessage = "Upload rate limit exceeded. Please wait a moment and try again.";
    } else if (error?.message?.includes("ENOTFOUND") || error?.message?.includes("network")) {
      userMessage = "Network error. Check your internet connection.";
    } else if (error?.message?.includes("File size too large")) {
      userMessage = "File exceeds Cloudinary's size limit.";
    }

    return NextResponse.json(
      { message: userMessage },
      { status: 500 }
    );
  }
}
