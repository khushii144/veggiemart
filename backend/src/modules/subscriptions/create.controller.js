import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { Product, Subscription, calculateNextDeliveryDate, connectDB, createNotification } from './service.js';

export async function POST(req) {
  try {
    const session = await getBackendSession(req);
    if (!session) {
      return json({ message: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    await connectDB();
    const { productId, quantity, frequency, deliveryDate } = await req.json();

    if (!productId) return json({ message: 'Product ID is required.' }, { status: 400 });

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return json({ message: 'Quantity must be a positive number.' }, { status: 400 });

    if (!frequency || !['weekly', 'monthly'].includes(frequency)) {
      return json({ message: 'Frequency must be either "weekly" or "monthly".' }, { status: 400 });
    }

    if (!deliveryDate) return json({ message: 'Delivery date/day is required.' }, { status: 400 });

    let nextDeliveryDate = null;
    try {
      nextDeliveryDate = calculateNextDeliveryDate({ frequency, deliveryDate });
    } catch (dateErr) {
      console.warn('Could not compute nextDeliveryDate:', dateErr.message);
    }

    let productName = 'vegetables';
    try {
      const prod = await Product.findById(productId);
      if (prod) productName = prod.name;
    } catch (prodErr) {
      console.warn('Could not fetch product details for notification:', prodErr);
    }

    const subscription = await Subscription.create({
      userId: session.user.id,
      productId,
      quantity: qty,
      frequency,
      deliveryDate,
      verificationStatus: 'pending',
      status: 'inactive',
      nextDeliveryDate,
    });

    await createNotification({
      isAdmin: true,
      title: 'Wholesale Subscription Request',
      message: `${session.user.name || session.user.email} requested a new ${frequency} subscription for ${productName} (${qty} pack(s)).`,
      type: 'pending_approval'
    });

    return json({ message: 'Subscription created successfully!', subscription }, { status: 201 });

  } catch (error) {
    console.error('Subscription API Error:', error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
