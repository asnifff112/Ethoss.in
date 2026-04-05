import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { userId, name, phone, addresses } = data;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required to update profile' },
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

    if (!dbData.users) {
      dbData.users = [];
    }

    const userIndex = dbData.users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user properties
    if (name) dbData.users[userIndex].name = name;
    if (phone) dbData.users[userIndex].phone = phone;
    if (addresses) dbData.users[userIndex].addresses = addresses;

    // Save back to db.json
    await fs.writeFile(filePath, JSON.stringify(dbData, null, 2));

    // Return sanitized user object (no password)
    const { password: _, ...userSession } = dbData.users[userIndex];

    return NextResponse.json(
      { message: 'Profile updated successfully', user: userSession },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
