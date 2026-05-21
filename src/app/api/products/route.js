import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return session;
}

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
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

  if (!category) {
    return null;
  }

  return {
    category: category.name,
    categorySlug: category.slug,
    categoryImage: category.image,
  };
}

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
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
    const categoryData = await resolveCategory(data);
    if (!categoryData) {
      return NextResponse.json({ message: 'Please select a valid category' }, { status: 400 });
    }

    const product = await Product.create({ ...data, ...categoryData, isAdminAdded: true });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { _id, id, isAdminAdded, ...data } = await req.json();
    const productId = _id || id;

    if (!productId) {
      return NextResponse.json({ message: 'Product id is required' }, { status: 400 });
    }

    const categoryData = await resolveCategory(data);
    if (!categoryData) {
      return NextResponse.json({ message: 'Please select a valid category' }, { status: 400 });
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId },
      { ...data, ...categoryData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
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
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ message: 'Product id is required' }, { status: 400 });
    }

    const product = await Product.findOneAndDelete({ _id: productId });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
