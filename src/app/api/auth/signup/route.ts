import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'src', 'data', 'db.json');

    // Read database
    let dbData: any;
    try {
      const fileContents = await fs.readFile(filePath, 'utf8');
      dbData = JSON.parse(fileContents);
    } catch (readError) {
      console.error('[Signup] Failed to read db.json:', readError);
      return NextResponse.json(
        { message: 'Unable to connect to the database. Please try again.' },
        { status: 500 }
      );
    }

    // Ensure users array exists
    if (!Array.isArray(dbData.users)) {
      dbData.users = [];
    }

    // Check if email already in use
    const existingUser = dbData.users.find((u: any) =>
      u.email?.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 409 }
      );
    }

    // Create new user — schema consistent with db.json
    const newUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // NOTE: hash this with bcrypt in production
      role: 'user',
      isBlocked: false,
      order_history: [] as any[],
    };

    dbData.users.push(newUser);

    // Persist back to db.json
    try {
      await fs.writeFile(filePath, JSON.stringify(dbData, null, 2), 'utf8');
    } catch (writeError) {
      console.error('[Signup] Failed to write db.json:', writeError);
      return NextResponse.json(
        { message: 'Failed to save user. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Account created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Signup] Unexpected error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
