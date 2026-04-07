import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);
    return NextResponse.json(db.studio_submissions || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error loading studio data' }, { status: 500 });
  }
}
