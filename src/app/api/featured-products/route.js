import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { restockUnavailableProducts } from '@/lib/productStock';

export async function GET() {
  try {
    await connectDB();
    await restockUnavailableProducts(Product);
    const products = await Product.find({ isAdminAdded: true }).sort({ createdAt: -1 }).limit(4);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
