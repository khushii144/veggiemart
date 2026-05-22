const mongoose = require('mongoose');

// Define Schema manually for test script to bypass ESM/CommonJS next imports if running directly via node
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  frequency: { type: String, enum: ['weekly', 'monthly'], required: true },
  deliveryDate: { type: String, required: true },
  verificationStatus: { type: String, default: 'pending', enum: ['pending', 'verified', 'rejected'] },
  status: { type: String, default: 'inactive', enum: ['inactive', 'active', 'cancelled'] },
}, { timestamps: true });

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const MONGODB_URI = 'mongodb://khushi2026y_db_user:PQMXUXPOieoY3tHy@ac-aphiojm-shard-00-00.hixh4tz.mongodb.net:27017,ac-aphiojm-shard-00-01.hixh4tz.mongodb.net:27017,ac-aphiojm-shard-00-02.hixh4tz.mongodb.net:27017/veggiemart?ssl=true&replicaSet=atlas-p3kfkr-shard-0&authSource=admin&retryWrites=true&w=majority';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    console.log('Fetching a user...');
    const user = await User.findOne({});
    if (!user) {
      console.log('No user found! Please seed or sign up first.');
      return;
    }
    console.log('Found user:', user.name, '(', user._id, ')');

    console.log('Fetching a product...');
    const product = await Product.findOne({});
    if (!product) {
      console.log('No product found! Please seed products first.');
      return;
    }
    console.log('Found product:', product.name, '(', product._id, ')');

    console.log('Creating a test subscription...');
    const sub = await Subscription.create({
      userId: user._id,
      productId: product._id,
      quantity: 3,
      frequency: 'monthly',
      deliveryDate: '10th of the month',
    });

    console.log('Subscription created successfully inside MongoDB!');
    console.log('Created subscription details:');
    console.log('- ID:', sub._id);
    console.log('- User ID:', sub.userId);
    console.log('- Product ID:', sub.productId);
    console.log('- Quantity:', sub.quantity);
    console.log('- Frequency:', sub.frequency);
    console.log('- Delivery Date:', sub.deliveryDate);
    console.log('- Verification Status (default):', sub.verificationStatus);
    console.log('- Status (default):', sub.status);

    console.log('Cleaning up test subscription...');
    await Subscription.findByIdAndDelete(sub._id);
    console.log('Cleaned up!');

  } catch (err) {
    console.error('Error running test script:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected!');
  }
}

run();
