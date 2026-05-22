import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is missing');
}

const arharDal = {
  name: 'Arhar Dal',
  description: 'Premium split pigeon peas, perfect for everyday dal and wholesome Indian meals.',
  price: 140,
  image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=900&auto=format&fit=crop',
  category: 'Organic Daals',
  categorySlug: 'organic-daals',
  discount: 0,
  stock: 80,
  isAdminAdded: true,
};

const fruitsImage = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=1200&auto=format&fit=crop';

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

await Category.updateOne(
  { slug: 'organic-daals' },
  {
    $set: {
      name: 'Organic Daals',
      slug: 'organic-daals',
      description: 'Wholesome organic pulses and lentils',
      image: 'https://cdn.shopaccino.com/refresh/articles/mixdal-170786_l.jpg?v=681',
      isActive: true,
    },
  },
  { upsert: true },
);

await Category.updateOne(
  { slug: 'fruits' },
  {
    $set: {
      name: 'Fruits',
      slug: 'fruits',
      description: 'Sweet, juicy, farm-picked fruits',
      image: fruitsImage,
      isActive: true,
    },
  },
  { upsert: true },
);

const replaced = await Product.updateMany(
  { name: { $regex: /^fresh cauliflower$/i } },
  { $set: arharDal },
);

if (replaced.matchedCount === 0) {
  await Product.updateOne({ name: 'Arhar Dal' }, { $set: arharDal }, { upsert: true });
}

await Product.updateMany(
  { categorySlug: 'fruits' },
  { $set: { categoryImage: fruitsImage } },
);

const arharCount = await Product.countDocuments({ name: 'Arhar Dal' });
const cauliflowerCount = await Product.countDocuments({ name: { $regex: /^fresh cauliflower$/i } });

await mongoose.disconnect();

console.log(`Fresh Cauliflower replaced: ${replaced.modifiedCount}.`);
console.log(`Arhar Dal products: ${arharCount}.`);
console.log(`Fresh Cauliflower products remaining: ${cauliflowerCount}.`);
console.log('Fruits category image updated.');
