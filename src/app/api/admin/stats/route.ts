import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'db.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileContents);

    const users = db.users || [];
    const products = db.products || [];

    // Calculate Total Sales
    let totalSales = 0;
    let pendingOrders = 0;

    users.forEach((user: any) => {
      (user.order_history || []).forEach((order: any) => {
        if (order.status === 'completed' || order.status === 'delivered') {
          totalSales += order.total_amount || 0;
        }
        if (order.status === 'pending' || order.status === 'processing') {
          pendingOrders++;
        }
      });
    });

    return NextResponse.json({
      totalSales: `₹${totalSales.toLocaleString('en-IN')}`,
      pendingOrders: pendingOrders.toString(),
      activeUsers: users.length.toString(),
      // Adding some mock 'change' percentages for visual aesthetic as requested in design rules
      stats: [
        { label: "Total Sales", value: `₹${totalSales.toLocaleString('en-IN')}`, change: "+0%" },
        { label: "Pending Orders", value: pendingOrders.toString(), change: "+0%" },
        { label: "Active Users", value: users.length.toString(), change: `+${users.length > 0 ? '100%' : '0%'}` },
      ]
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
