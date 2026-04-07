import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);
    return NextResponse.json(db.products || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error loading products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);

    const newProduct = {
      ...product,
      id: `p-${Date.now()}`,
      image_urls: product.image_urls || [],
      shippingPrice: product.shippingPrice || 0,
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      showLowStock: product.showLowStock !== undefined ? product.showLowStock : false
    };

    db.products.push(newProduct);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const product = await request.json();
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);

    const index = db.products.findIndex((p: any) => p.id === product.id);
    if (index === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    db.products[index] = {
      ...db.products[index],
      ...product,
      image_urls: product.image_urls || db.products[index].image_urls || [],
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : db.products[index].isAvailable,
      showLowStock: product.showLowStock !== undefined ? product.showLowStock : db.products[index].showLowStock
    };

    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json(db.products[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const fileContent = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileContent);

    db.products = db.products.filter((p: any) => p.id !== id);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
