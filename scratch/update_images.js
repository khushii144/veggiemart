const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const MONGODB_URI = envContent.match(/MONGODB_URI=(.*)/)?.[1]?.trim();

const productImages = {
  'Tomato': '1582284540020-8acaf0195b7b',
  'Spinach': '1576045057995-568f588f82fb',
  'Carrot': '1598170845058-32b9d6a5da37',
  'Eggplant': '1628556270448-4d4e4148e1b1',
  'Pepper': '1566567114443-4f934241680d',
  'Broccoli': '1459411621453-7b03977f4bfc',
  'Onion': '1618512496248-a07fe83aa8cb',
  'Potato': '1518977676601-b53f02ac6d31',
  'Cauliflower': '1568584711075-3d021a7c3ec3',
  'Chilli': '1588252303782-cb80119f702e',
  'Ginger': '1615485273519-465559c19045'
};

async function updateImages() {
  await mongoose.connect(MONGODB_URI);
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ name: String, image: String }));
  
  const products = await Product.find({});
  for (const product of products) {
    for (const [keyword, id] of Object.entries(productImages)) {
      if (product.name.toLowerCase().includes(keyword.toLowerCase())) {
        const url = `https://images.unsplash.com/photo-${id}?q=80&w=1000&auto=format&fit=crop`;
        await Product.updateOne({ _id: product._id }, { $set: { image: url } });
        console.log(`Updated ${product.name} with verified ID ${id}`);
        break;
      }
    }
  }
  process.exit(0);
}
updateImages();
