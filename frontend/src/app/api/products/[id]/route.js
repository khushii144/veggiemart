import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { restockUnavailableProducts } from '../../_stock';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    await connectDB();
    await restockUnavailableProducts(Product);

    const { id } = await params;
    const product = await Product.findOne({ _id: id, isAdminAdded: true });

    if (!product) {
      return Response.json({ message: 'Product not found' }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
