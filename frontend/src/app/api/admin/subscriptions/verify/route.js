import { proxyAuthenticatedBackendRequest } from '../../../_backendAuthProxy';

export const dynamic = 'force-dynamic';

export function POST(request) {
  return proxyAuthenticatedBackendRequest(request, '/api/admin/subscriptions/verify');
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  });
}
