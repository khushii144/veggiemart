import { proxyAuthenticatedBackendRequest } from '../../_backendAuthProxy';

export const dynamic = 'force-dynamic';

const allowedActions = new Set(['cancel', 'create', 'status', 'update', 'user']);

async function proxySubscriptionRequest(request, { params }) {
  const { action } = await params;
  if (!allowedActions.has(action)) {
    return Response.json({ message: 'Subscription route not found' }, { status: 404 });
  }

  return proxyAuthenticatedBackendRequest(request, `/api/subscription/${action}`);
}

export function GET(request, context) {
  return proxySubscriptionRequest(request, context);
}

export function POST(request, context) {
  return proxySubscriptionRequest(request, context);
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, OPTIONS',
    },
  });
}
