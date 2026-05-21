const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const MONGODB_URI = envContent.match(/MONGODB_URI=(.*)/)[1].trim();

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
  }, { timestamps: true }));

  const adminExists = await User.findOne({ email: 'admin@veggiemart.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@veggiemart.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }
  process.exit(0);
}

createAdmin();
