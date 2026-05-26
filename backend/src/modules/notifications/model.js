import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isAdmin: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'approved',
      'rejected',
      'cancelled',
      'paused',
      'resumed',
      'recurring_created',
      'delivery_reminder',
      'renewal_reminder',
      'new_subscription',
      'recurring_failed',
      'pending_approval',
      'user_registered',
      'user_login',
      'product_created',
      'product_updated',
      'product_deleted',
      'low_stock',
      'wholesale_inquiry',
      'recurring_processed',
      'new_order'
    ]
  },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
