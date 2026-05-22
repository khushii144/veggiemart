import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { restockUnavailableProducts } from '@/lib/productStock';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    await restockUnavailableProducts(Product);
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const product = await Product.findOne({ _id: id, isAdminAdded: true });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
