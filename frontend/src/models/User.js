import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  lastLoginAt: { type: Date, default: null },
  walletBalance: { type: Number, default: 0 },
  addresses: [{
    label: { type: String, default: 'Home' },
    street: String,
    city: String,
    state: String,
    zip: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
