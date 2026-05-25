import { json } from '../../lib/response.js';
import { processRecurringOrders } from './service.js';

export async function GET(req) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const incomingAuth = req.headers.get('authorization');
    const incomingLegacy = req.headers.get('x-cron-secret');

    const expectedAuth = `Bearer ${cronSecret}`;
    const isValid =
      !cronSecret ||
      incomingAuth === expectedAuth ||
      incomingLegacy === cronSecret;

    if (!isValid) {
      return json({ message: 'Forbidden: invalid cron secret.' }, { status: 403 });
    }

    console.log('[Cron] Starting recurring subscription processing...');
    const result = await processRecurringOrders();
    console.log('[Cron] Completed:\n' + result.logs.join('\n'));

    return json({ message: 'Recurring order processing complete.', ...result }, { status: 200 });

  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return json({ message: 'Internal Server Error during cron processing.', error: error.message }, { status: 500 });
  }
}
