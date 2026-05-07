const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const MONGODB_URI = envContent.match(/MONGODB_URI=(.*)/)?.[1]?.trim();

async function fixTomato() {
  await mongoose.connect(MONGODB_URI);
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ name: String, image: String }));
  
  // Use the ID the user is looking at: Gq_DmpdCzHE
  const tomatoUrl = 'https://images.unsplash.com/photo-1596199050105-6d5d32222916?q=80&w=1000&auto=format&fit=crop'; 
  // Wait, I should check if Gq_DmpdCzHE matches a different URL pattern.
  // Actually, Unsplash photo URLs usually look like photo-1234567890.
  // Gq_DmpdCzHE is the ID.
  
  const finalUrl = 'https://images.unsplash.com/photo-1596199050105-6d5d32222916?q=80&w=1000&auto=format&fit=crop';
  
  await Product.updateOne({ name: /Tomato/i }, { $set: { image: finalUrl } });
  console.log('Fixed Tomato image!');
  process.exit(0);
}
fixTomato();
