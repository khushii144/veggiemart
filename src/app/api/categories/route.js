import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { categories as starterCategories } from '@/lib/categories';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const UNCATEGORIZED = {
  name: 'Uncategorized',
  slug: 'uncategorized',
  description: 'Products waiting for a category',
  image: '/images/categories/all.jpg',
};

const HIDDEN_CATEGORY_SLUGS = new Set(['uncategorized', 'organic-packs', 'fertilizers', 'greens']);

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeImage(value) {
  const image = value?.trim();
  if (!image) return '/images/categories/all.jpg';
  if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) return image;
  return '/images/categories/all.jpg';
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin' ? session : null;
}

async function ensureBaseCategories() {
  const count = await Category.countDocuments();
  if (count > 0) return;

  const initialCategories = starterCategories
    .filter((category) => category.id !== 'All' && !HIDDEN_CATEGORY_SLUGS.has(slugify(category.id || category.name)))
    .map((category) => ({
      name: category.name,
      slug: slugify(category.id || category.name),
      description: category.desc || '',
            image: normalizeImage(category.image),
      isActive: true,
    }));

  await Category.bulkWrite([
    ...initialCategories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $setOnInsert: category },
        upsert: true,
      },
    })),
    {
      updateOne: {
        filter: { slug: UNCATEGORIZED.slug },
        update: { $setOnInsert: { ...UNCATEGORIZED, isActive: true } },
        upsert: true,
      },
    },
  ]);
}

async function syncLegacyProductCategories() {
  const products = await Product.find({}, 'category categorySlug image').lean();
  const existing = new Set((await Category.find({}, 'slug').lean()).map((category) => category.slug));
  const writes = [];

  products.forEach((product) => {
    const name = product.category?.trim();
    if (!name) return;

    const slug = product.categorySlug || slugify(name);
    if (!slug || existing.has(slug)) return;

    existing.add(slug);
    writes.push({
      updateOne: {
        filter: { slug },
        update: {
          $setOnInsert: {
            name,
            slug,
            description: '',
            image: normalizeImage(product.image),
            isActive: true,
          },
        },
        upsert: true,
      },
    });
  });

  if (writes.length > 0) {
    await Category.bulkWrite(writes);
  }
}

export async function GET() {
  try {
    await connectDB();
    await ensureBaseCategories();
    await syncLegacyProductCategories();
    await Category.updateMany(
      { image: { $regex: '^(?!/|https?://)' } },
      { $set: { image: '/images/categories/all.jpg' } },
    );

    const categories = await Category.find({ slug: { $nin: Array.from(HIDDEN_CATEGORY_SLUGS) } }).sort({ name: 1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const name = data.name?.trim();
    const slug = slugify(data.slug || name || '');

    if (!name || !slug) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const category = await Category.create({
      name,
      slug,
      description: data.description?.trim() || '',
      image: normalizeImage(data.image),
      isActive: data.isActive ?? true,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Category slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const categoryId = data._id || data.id;
    const name = data.name?.trim();
    const slug = slugify(data.slug || name || '');

    if (!categoryId || !name || !slug) {
      return NextResponse.json({ message: 'Category id, name, and slug are required' }, { status: 400 });
    }

    const previous = await Category.findById(categoryId);
    if (!previous) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        slug,
        description: data.description?.trim() || '',
        image: normalizeImage(data.image),
        isActive: data.isActive ?? true,
      },
      { new: true, runValidators: true },
    );

    await Product.updateMany(
      { $or: [{ categorySlug: previous.slug }, { category: previous.name }] },
      { $set: { category: category.name, categorySlug: category.slug, categoryImage: category.image } },
    );

    return NextResponse.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Category slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json({ message: 'Category id is required' }, { status: 400 });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    if (category.slug === UNCATEGORIZED.slug) {
      return NextResponse.json({ message: 'Uncategorized cannot be deleted' }, { status: 400 });
    }

    const fallback = await Category.findOneAndUpdate(
      { slug: UNCATEGORIZED.slug },
      { $setOnInsert: { ...UNCATEGORIZED, isActive: true } },
      { upsert: true, new: true },
    );

    const reassigned = await Product.updateMany(
      { $or: [{ categorySlug: category.slug }, { category: category.name }] },
      { $set: { category: fallback.name, categorySlug: fallback.slug, categoryImage: fallback.image } },
    );

    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({
      message: 'Category deleted successfully',
      reassignedProducts: reassigned.modifiedCount || 0,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
