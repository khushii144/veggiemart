import { proxyAuthenticatedBackendRequest } from '../../_backendAuthProxy';

export const dynamic = 'force-dynamic';

export function GET(request) {
  return proxyAuthenticatedBackendRequest(request, '/api/admin/customers');
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'GET, OPTIONS',
    },
  });
}
