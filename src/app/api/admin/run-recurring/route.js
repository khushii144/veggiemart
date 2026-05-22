/**
 * POST /api/admin/run-recurring
 * ------------------------------
 * Admin-only manual trigger for the recurring order engine.
 * Used by the Admin Subscriptions panel "Run Now" button.
 * Protected by NextAuth admin role check — no cron secret required.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { processRecurringOrders } from '@/lib/recurringOrders';

export async function POST(req) {
  try {
    // Admin-only guard
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admins only.' }, { status: 401 });
    }

    console.log(`[Admin Trigger] ${session.user.email} triggered recurring order run.`);
    const result = await processRecurringOrders();
    console.log('[Admin Trigger] Completed:\n' + result.logs.join('\n'));

    return NextResponse.json({
      message: 'Recurring orders processed successfully.',
      ...result,
    }, { status: 200 });

  } catch (error) {
    console.error('[Admin Trigger] Fatal error:', error);
    return NextResponse.json({
      message: 'Internal Server Error.',
      error: error.message,
    }, { status: 500 });
  }
}
