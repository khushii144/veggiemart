import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import { DEFAULT_PRODUCT_STOCK } from '../src/lib/productStock.js';

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

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

const result = await Product.updateMany(
  {
    $or: [
      { stock: { $exists: false } },
      { stock: null },
      { stock: { $lte: 0 } },
    ],
  },
  { $set: { stock: DEFAULT_PRODUCT_STOCK } },
);

const stillOutOfStock = await Product.countDocuments({
  $or: [
    { stock: { $exists: false } },
    { stock: null },
    { stock: { $lte: 0 } },
  ],
});

await mongoose.disconnect();

console.log(`Restocked ${result.modifiedCount} product(s) to ${DEFAULT_PRODUCT_STOCK}.`);
console.log(`Products still out of stock: ${stillOutOfStock}.`);
