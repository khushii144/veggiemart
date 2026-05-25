import { json } from '../../lib/response.js';
import { Product, connectDB, restockUnavailableProducts } from './service.js';

export async function GET() {
  try {
    await connectDB();
    await restockUnavailableProducts(Product);
    const products = await Product.find({ isAdminAdded: true }).sort({ createdAt: -1 }).limit(4);
    return json(products);
  } catch (error) {
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
