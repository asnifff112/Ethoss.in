import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContents);
    return NextResponse.json(db.users || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error loading users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, isBlocked } = await request.json();
    const fileContents = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContents);

    const userIndex = db.users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Toggle blocking status
    db.users[userIndex].isBlocked = isBlocked;

    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({ message: 'User status updated successfully', user: db.users[userIndex] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user status' }, { status: 500 });
  }
}
