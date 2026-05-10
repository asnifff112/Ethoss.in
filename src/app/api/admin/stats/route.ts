import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Feedback from '@/models/Feedback';
import User from '@/models/User';
import ManualSale from '@/models/ManualSale';

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

    // Calculate Total Revenue from manual sales
    const revenueResult = await ManualSale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } }
        }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    console.log(`[STATS API] Success. P:${totalProducts} F:${totalFeedbacks} U:${totalUsers} R:${totalRevenue}`);

    return NextResponse.json({
      stats: [
        { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, change: "Gross Turnover" },
        { label: "Total Products", value: totalProducts.toString(), change: `${inStockCount} in stock` },
        { label: "Total Feedbacks", value: totalFeedbacks.toString(), change: "Customer Reviews" },
        { label: "Total Users", value: totalUsers.toString(), change: "Registered" },
      ]
    }, { status: 200 });

  } catch (error: any) {
    console.error("[STATS API] Error:", error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
