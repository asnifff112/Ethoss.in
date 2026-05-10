import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Feedback from '@/models/Feedback';
import User from '@/models/User';

export async function GET() {
  try {
    console.log("[STATS API] Connecting to MongoDB...");
    await connectToDatabase();

    // Query MongoDB for actual counts
    const totalProducts = await Product.countDocuments();
    const soldOutCount = await Product.countDocuments({ is_sold_out: true });
    const inStockCount = totalProducts - soldOutCount;
    const totalFeedbacks = await Feedback.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log(`[STATS API] Success. P:${totalProducts} F:${totalFeedbacks} U:${totalUsers}`);

    return NextResponse.json({
      stats: [
        { label: "Total Products", value: totalProducts.toString(), change: `${inStockCount} in stock` },
        { label: "Sold Out Items", value: soldOutCount.toString(), change: soldOutCount > 0 ? "Needs restock" : "All available" },
        { label: "Total Feedbacks", value: totalFeedbacks.toString(), change: totalFeedbacks > 0 ? "New messages" : "No messages" },
        { label: "Total Users", value: totalUsers.toString(), change: totalUsers > 1 ? "Registered accounts" : "Admin only" },
      ]
    }, { status: 200 });

  } catch (error: any) {
    console.error("[STATS API] Error:", error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
