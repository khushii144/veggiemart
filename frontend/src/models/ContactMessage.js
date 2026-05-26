import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, required: true },
  topic: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
