import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'src', 'data', 'db.json');
    let dbData;

    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      dbData = JSON.parse(fileContents);
    } catch {
      return NextResponse.json(
        { message: 'Failed to access database' },
        { status: 500 }
      );
    }

    // Ensure users array exists
    if (!dbData.users) {
      dbData.users = [];
    }

    // Find the user
    const user = dbData.users.find((u: any) => u.email === email);

    // Validate credentials
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Prepare session data (exclude sensitive info)
    const { password: _, ...userSession } = user;

    return NextResponse.json(userSession, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
