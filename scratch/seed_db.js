const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const MONGODB_URI = envContent.match(/MONGODB_URI=(.*)/)[1].trim();

const initialProducts = [
  { name: 'Organic Tomatoes', description: 'Fresh, juicy organic tomatoes grown in sun-drenched fields.', price: 40, image: 'https://images.unsplash.com/photo-1582284540020-8acaf0195b7b?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 50, isAdminAdded: false },
  { name: 'Fresh Spinach', description: 'Crispy and nutrient-rich green spinach leaves.', price: 30, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=900&auto=format&fit=crop', category: 'Greens', stock: 30, isAdminAdded: false },
  { name: 'Orange Carrots', description: 'Sweet and crunchy organic carrots, perfect for snacks or cooking.', price: 50, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 100, isAdminAdded: false },
  { name: 'Purple Eggplant', description: 'Large, glossy purple eggplants with a tender texture.', price: 45, image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 40, isAdminAdded: false },
  { name: 'Bell Peppers Mix', description: 'A colorful assortment of sweet red, yellow, and green bell peppers.', price: 120, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 25, isAdminAdded: false },
  { name: 'Organic Broccoli', description: 'Fresh heads of organic broccoli, high in vitamins.', price: 80, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 60, isAdminAdded: false },
  { name: 'Red Onions', description: 'Sharp and flavorful red onions, essential for every kitchen.', price: 35, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 200, isAdminAdded: false },
  { name: 'Golden Potatoes', description: 'Versatile golden potatoes, great for mashing or roasting.', price: 25, image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 150, isAdminAdded: false },
  { name: 'Fresh Cauliflower', description: 'Large, white cauliflower heads, perfect for curries.', price: 55, image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 40, isAdminAdded: false },
  { name: 'Green Chillies', description: 'Spicy green chillies to add heat to your dishes.', price: 15, image: 'https://images.unsplash.com/photo-1588252303782-cb80119f702e?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 500, isAdminAdded: false },
  { name: 'Organic Ginger', description: 'Fresh and aromatic ginger root for flavor and health.', price: 150, image: 'https://images.unsplash.com/photo-1615485273519-465559c19045?q=80&w=900&auto=format&fit=crop', category: 'Vegetables', stock: 20, isAdminAdded: false }
];

async function seedDB() {
  await mongoose.connect(MONGODB_URI);
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, default: 0 },
    isAdminAdded: { type: Boolean, default: false },
  }, { timestamps: true }));
  
  await Product.deleteMany({});
  await Product.insertMany(initialProducts);
  console.log('Database seeded successfully!');
  process.exit(0);
}
seedDB();
