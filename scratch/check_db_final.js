const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const MONGODB_URI = envContent.match(/MONGODB_URI=(.*)/)?.[1]?.trim();

async function checkDB() {
  await mongoose.connect(MONGODB_URI);
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ name: String, image: String }));
  const products = await Product.find({});
  console.log(`Total products: ${products.length}`);
  products.forEach(p => {
    console.log(`- '${p.name}': '${p.image}'`);
  });
  process.exit(0);
}
checkDB();
