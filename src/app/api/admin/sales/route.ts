import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import ManualSale from "@/models/ManualSale";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const sales = await ManualSale.find({}).sort({ saleDate: -1 });
    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching sales", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await connectToDatabase();
    const newSale = await ManualSale.create(body);
    return NextResponse.json(newSale, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error creating sale", error: error.message }, { status: 500 });
  }
}
