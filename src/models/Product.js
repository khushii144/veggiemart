import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  stock: { type: Number, default: 0 },
  isAdminAdded: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
