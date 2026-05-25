import { json } from '../../lib/response.js';
import { Product, connectDB, restockUnavailableProducts } from './service.js';

export async function GET(request, { params }) {
  try {
    await connectDB();
    await restockUnavailableProducts(Product);
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const product = await Product.findOne({ _id: id, isAdminAdded: true });
    if (!product) {
      return json({ message: 'Product not found' }, { status: 404 });
    }
    return json(product);
  } catch (error) {
    return json({ message: error.message }, { status: 500 });
  }
}
