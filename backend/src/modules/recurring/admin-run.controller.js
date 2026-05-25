import { json } from '../../lib/response.js';
import { getBackendSession } from '../../session.js';
import { processRecurringOrders } from './service.js';

export async function POST(req) {
  try {
    const session = await getBackendSession(req);
    if (!session || session.user.role !== 'admin') {
      return json({ message: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    console.log(`[Admin Trigger] ${session.user.email} triggered recurring order run.`);
    const result = await processRecurringOrders();
    console.log('[Admin Trigger] Completed:\n' + result.logs.join('\n'));

    return json({ message: 'Recurring orders processed successfully.', ...result }, { status: 200 });

  } catch (error) {
    console.error('[Admin Trigger] Fatal error:', error);
    return json({ message: 'Internal Server Error.', error: error.message }, { status: 500 });
  }
}
