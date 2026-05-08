import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('[Products GET] Error:', error);
    return NextResponse.json({ message: 'Error loading products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const productData = await request.json();
    
    // Create new product using Mongoose
    const newProduct = await Product.create({
      name: productData.name || "",
      caption: productData.caption || "",
      original_price: productData.original_price || 0,
      price: productData.price || 0,
      delivery_charge: productData.delivery_charge || 0,
      category_id: productData.category_id || "",
      images: productData.images || [],
      is_sold_out: productData.is_sold_out ?? false,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('[Products POST] Error:', error);
    return NextResponse.json({ message: 'Error adding product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const productData = await request.json();
    
    // We expect the frontend to pass the mongodb _id as `id` or `_id`. 
    // We'll check both just in case, but usually, id is used.
    const idToUpdate = productData._id || productData.id;

    if (!idToUpdate) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      idToUpdate,
      {
        $set: {
          name: productData.name,
          caption: productData.caption,
          original_price: productData.original_price,
          price: productData.price,
          delivery_charge: productData.delivery_charge,
          category_id: productData.category_id,
          images: productData.images,
          is_sold_out: productData.is_sold_out,
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('[Products PUT] Error:', error);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[Products DELETE] Error:', error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
