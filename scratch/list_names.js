const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const MONGODB_URI = envContent.match(/MONGODB_URI=(.*)/)?.[1]?.trim();

async function listNames() {
  await mongoose.connect(MONGODB_URI);
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ name: String }));
  const products = await Product.find({});
  products.forEach(p => console.log(`'${p.name}'`));
  process.exit(0);
}
listNames();
