const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

const ProductSchema = new mongoose.Schema({
  name: String,
  image: String,
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function checkProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    const products = await Product.find({});
    console.log('Products found:', products.length);
    products.forEach(p => {
      console.log(`- ${p.name}: ${p.image}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
