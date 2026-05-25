import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { Category, Product, connectDB, normalizeProductStock, restockUnavailableProducts } from './service.js';

const starterVegetables = [
  { name: 'Organic Tomatoes', description: 'Fresh, juicy organic tomatoes grown in sun-drenched fields.', price: 40, image: 'https://images.unsplash.com/photo-1582284540020-8acaf0195b7b?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', categorySlug: 'vegetables', discount: 0, stock: 50, isAdminAdded: true },
  { name: 'Orange Carrots', description: 'Sweet and crunchy organic carrots, perfect for snacks or cooking.', price: 50, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', categorySlug: 'vegetables', discount: 0, stock: 100, isAdminAdded: true },
  { name: 'Purple Eggplant', description: 'Large, glossy purple eggplants with a tender texture.', price: 45, image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', categorySlug: 'vegetables', discount: 0, stock: 40, isAdminAdded: true },
  { name: 'Organic Broccoli', description: 'Fresh heads of organic broccoli, high in vitamins.', price: 80, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', categorySlug: 'vegetables', discount: 0, stock: 60, isAdminAdded: true },
  { name: 'Golden Potatoes', description: 'Versatile golden potatoes, great for mashing or roasting.', price: 25, image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', categorySlug: 'vegetables', discount: 0, stock: 150, isAdminAdded: true },
  { name: 'Arhar Dal', description: 'Premium split pigeon peas, perfect for everyday dal and wholesome Indian meals.', price: 140, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=900&auto=format&fit=crop', category: 'Organic Daals', categorySlug: 'organic-daals', discount: 0, stock: 80, isAdminAdded: true },
];

async function requireAdmin(req) {
  const session = await getBackendSession(req);
  if (!session || session.user.role !== 'admin') return null;
  return session;
}

function slugify(value) {
  return value.toString().trim().toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function resolveCategory(data) {
  const requestedSlug = data.categorySlug || slugify(data.category || '');
  const requestedName = data.category?.trim();
  const category = await Category.findOne({
    $or: [
      ...(requestedSlug ? [{ slug: requestedSlug }] : []),
      ...(requestedName ? [{ name: requestedName }] : []),
    ],
  });
  if (!category) return null;
  return { category: category.name, categorySlug: category.slug, categoryImage: category.image };
}

async function ensureVegetableProducts() {
  const vegetableCount = await Product.countDocuments({
    isAdminAdded: true,
    $or: [{ categorySlug: 'vegetables' }, { category: 'Vegetables' }],
  });
  if (vegetableCount > 0) return;
  await Product.bulkWrite(
    starterVegetables.map((product) => ({
      updateOne: { filter: { name: product.name }, update: { $set: product }, upsert: true },
    })),
  );
}

export async function GET() {
  try {
    await connectDB();
    await ensureVegetableProducts();
    await restockUnavailableProducts(Product);
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return json(products);
  } catch (error) {
    return json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await requireAdmin(req);
    if (!session) return json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const data = await req.json();
    const categoryData = await resolveCategory(data);
    if (!categoryData) return json({ message: 'Please select a valid category' }, { status: 400 });

    const product = await Product.create({
      ...data,
      ...categoryData,
      stock: normalizeProductStock(data.stock),
      isAdminAdded: true,
    });
    return json(product, { status: 201 });
  } catch (error) {
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await requireAdmin(req);
    if (!session) return json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { _id, id, isAdminAdded, ...data } = await req.json();
    const productId = _id || id;

    if (!productId) return json({ message: 'Product id is required' }, { status: 400 });

    const categoryData = await resolveCategory(data);
    if (!categoryData) return json({ message: 'Please select a valid category' }, { status: 400 });

    const product = await Product.findOneAndUpdate(
      { _id: productId },
      { ...data, ...categoryData, stock: normalizeProductStock(data.stock) },
      { new: true, runValidators: true },
    );

    if (!product) return json({ message: 'Product not found' }, { status: 404 });
    return json(product);
  } catch (error) {
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await requireAdmin(req);
    if (!session) return json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) return json({ message: 'Product id is required' }, { status: 400 });

    const product = await Product.findOneAndDelete({ _id: productId });
    if (!product) return json({ message: 'Product not found' }, { status: 404 });

    return json({ message: 'Product deleted successfully' });
  } catch (error) {
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
