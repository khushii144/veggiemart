import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  frequency: { type: String, enum: ['weekly', 'monthly'], required: true },
  deliveryDate: { type: String, required: true },
  verificationStatus: { type: String, default: 'pending', enum: ['pending', 'verified', 'rejected'] },
  status: { type: String, default: 'inactive', enum: ['inactive', 'active', 'cancelled', 'paused'] },
  nextDeliveryDate: { type: Date, default: null },
  lastOrderDate: { type: Date, default: null },
  lastOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
