import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

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

    // Check if user exists
    const existingUser = dbData.users.find((u: any) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      password, // In a real app this would be hashed (e.g. bcrypt)
      order_history: []
    };

    dbData.users.push(newUser);

    // Save back to db.json
    await fs.writeFile(filePath, JSON.stringify(dbData, null, 2));

    return NextResponse.json(
      { message: 'Account created successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
