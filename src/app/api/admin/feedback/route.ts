import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);
    return NextResponse.json(db.feedbacks || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error loading feedback data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const feedback = await request.json();
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);

    const newFeedback = {
      ...feedback,
      id: `f-${Date.now()}`,
      status: feedback.status || 'approved'
    };

    if (!db.feedbacks) db.feedbacks = [];
    db.feedbacks.unshift(newFeedback);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding feedback' }, { status: 500 });
  }
}
