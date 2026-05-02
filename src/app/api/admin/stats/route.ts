import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'db.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileContents);

    const products = db.products || [];
    const feedbacks = db.feedbacks || [];

    const totalProducts = products.length;
    const soldOutCount = products.filter((p: any) => p.is_sold_out).length;
    const inStockCount = totalProducts - soldOutCount;
    const totalFeedbacks = feedbacks.length;

    return NextResponse.json({
      stats: [
        { label: "Total Products", value: totalProducts.toString(), change: `${inStockCount} in stock` },
        { label: "Sold Out Items", value: soldOutCount.toString(), change: soldOutCount > 0 ? "Needs restock" : "All available" },
        { label: "Total Feedbacks", value: totalFeedbacks.toString(), change: totalFeedbacks > 0 ? "New messages" : "No messages" },
      ]
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
