import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getAdminSession } from '../_adminAuth';
import {
  ensureBaseCategories,
  normalizeImage,
  slugify,
  syncLegacyProductCategories,
  UNCATEGORIZED,
} from '../_categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    await ensureBaseCategories();
    await syncLegacyProductCategories();
    await Category.updateMany(
      { image: { $regex: '^(?!/|https?://)' } },
      { $set: { image: '/images/categories/all.jpg' } }
    );

    const categories = await Category.find({ slug: { $ne: 'uncategorized' } }).sort({ name: 1 }).lean();
    return Response.json(categories);
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const data = await request.json();
    const name = data.name?.trim();
    const slug = slugify(data.slug || name || '');

    if (!name || !slug) return Response.json({ message: 'Category name is required' }, { status: 400 });

    const category = await Category.create({
      name,
      slug,
      description: data.description?.trim() || '',
      image: normalizeImage(data.image),
      isActive: data.isActive ?? true,
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    if (error.code === 11000) return Response.json({ message: 'Category slug already exists' }, { status: 409 });
    return Response.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const data = await request.json();
    const categoryId = data._id || data.id;
    const name = data.name?.trim();
    const slug = slugify(data.slug || name || '');

    if (!categoryId || !name || !slug) {
      return Response.json({ message: 'Category id, name, and slug are required' }, { status: 400 });
    }

    const previous = await Category.findById(categoryId);
    if (!previous) return Response.json({ message: 'Category not found' }, { status: 404 });

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        slug,
        description: data.description?.trim() || '',
        image: normalizeImage(data.image),
        isActive: data.isActive ?? true,
      },
      { new: true, runValidators: true }
    );

    await Product.updateMany(
      { $or: [{ categorySlug: previous.slug }, { category: previous.name }] },
      { $set: { category: category.name, categorySlug: category.slug, categoryImage: category.image } }
    );

    return Response.json(category);
  } catch (error) {
    if (error.code === 11000) return Response.json({ message: 'Category slug already exists' }, { status: 409 });
    return Response.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) return Response.json({ message: 'Category id is required' }, { status: 400 });

    const category = await Category.findById(categoryId);
    if (!category) return Response.json({ message: 'Category not found' }, { status: 404 });
    if (category.slug === UNCATEGORIZED.slug) {
      return Response.json({ message: 'Uncategorized cannot be deleted' }, { status: 400 });
    }

    const fallback = await Category.findOneAndUpdate(
      { slug: UNCATEGORIZED.slug },
      { $setOnInsert: { ...UNCATEGORIZED, isActive: true } },
      { upsert: true, new: true }
    );

    const reassigned = await Product.updateMany(
      { $or: [{ categorySlug: category.slug }, { category: category.name }] },
      { $set: { category: fallback.name, categorySlug: fallback.slug, categoryImage: fallback.image } }
    );

    await Category.findByIdAndDelete(categoryId);

    return Response.json({
      message: 'Category deleted successfully',
      reassignedProducts: reassigned.modifiedCount || 0,
    });
  } catch (error) {
    return Response.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
