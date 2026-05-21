/**
 * GET /api/cron/process-subscriptions
 * -------------------------------------
 * Protected cron endpoint that triggers recurring order generation.
 *
 * Security: requires the header  x-cron-secret: <CRON_SECRET>
 * Set CRON_SECRET in your .env file. Point any external cron scheduler
 * (Vercel Cron, cron-job.org, GitHub Actions, etc.) at this URL with that header.
 *
 * Example Vercel cron config in vercel.json:
 * {
 *   "crons": [{ "path": "/api/cron/process-subscriptions", "schedule": "0 2 * * *" }]
 * }
 */

import { NextResponse } from 'next/server';
import { processRecurringOrders } from '@/lib/recurringOrders';

export async function GET(req) {
  try {
    // -----------------------------------------------------------------------
    // Security: validate cron secret
    // -----------------------------------------------------------------------
    const cronSecret = process.env.CRON_SECRET;
    const incoming = req.headers.get('x-cron-secret');

    // If CRON_SECRET is set in env, enforce it. If not set, allow open access
    // (useful for local development — set CRON_SECRET in production always).
    if (cronSecret && incoming !== cronSecret) {
      return NextResponse.json({ message: 'Forbidden: invalid cron secret.' }, { status: 403 });
    }

    // -----------------------------------------------------------------------
    // Run the recurring order engine
    // -----------------------------------------------------------------------
    console.log('[Cron] Starting recurring subscription processing...');
    const result = await processRecurringOrders();
    console.log('[Cron] Completed:\n' + result.logs.join('\n'));

    return NextResponse.json({
      message: 'Recurring order processing complete.',
      ...result,
    }, { status: 200 });

  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json({
      message: 'Internal Server Error during cron processing.',
      error: error.message,
    }, { status: 500 });
  }
}
