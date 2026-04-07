import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);
    return NextResponse.json(db.orders || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error loading orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);

    const index = db.orders.findIndex((o: any) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    db.orders[index].status = status;
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json(db.orders[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
  }
}
