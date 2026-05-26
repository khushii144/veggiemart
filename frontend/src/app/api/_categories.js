import Category from '@/models/Category';
import Product from '@/models/Product';

export const UNCATEGORIZED = {
  name: 'Uncategorized',
  slug: 'uncategorized',
  description: 'Products waiting for a category',
  image: '/images/categories/all.jpg',
};

const starterCategories = [
  { name: 'Vegetables', slug: 'vegetables', description: 'Fresh organic vegetables', image: '/images/categories/vegetables.jpg' },
  { name: 'Organic Daals', slug: 'organic-daals', description: 'Organic pulses and daals', image: '/images/categories/daals.jpg' },
];

export function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeImage(value) {
  const image = value?.trim();
  if (!image) return '/images/categories/all.jpg';
  if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) return image;
  return '/images/categories/all.jpg';
}

export async function ensureBaseCategories() {
  await Category.bulkWrite([
    ...starterCategories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $setOnInsert: { ...category, isActive: true } },
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

export async function syncLegacyProductCategories() {
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

  if (writes.length > 0) await Category.bulkWrite(writes);
}
