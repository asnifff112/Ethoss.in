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
      id: `p-${Date.now()}`,
      name: product.name || "",
      caption: product.caption || "",
      original_price: product.original_price || 0,
      price: product.price || 0,
      delivery_charge: product.delivery_charge || 0,
      category_id: product.category_id || "",
      images: product.images || [],
      is_sold_out: product.is_sold_out ?? false,
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
      name: product.name ?? db.products[index].name,
      caption: product.caption ?? db.products[index].caption,
      original_price: product.original_price ?? db.products[index].original_price,
      price: product.price ?? db.products[index].price,
      delivery_charge: product.delivery_charge ?? db.products[index].delivery_charge,
      category_id: product.category_id ?? db.products[index].category_id,
      images: product.images ?? db.products[index].images,
      is_sold_out: product.is_sold_out ?? db.products[index].is_sold_out,
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
