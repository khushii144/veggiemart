import { getToken } from 'next-auth/jwt';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
const sessionCookieNames = [
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
  '__Secure-authjs.session-token',
  'authjs.session-token',
];

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};

  return Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [name, ...value] = cookie.trim().split('=');
      return [name, value.join('=')];
    }).filter(([name]) => name)
  );
}

function readRawSessionCookie(request) {
  const cookies = parseCookies(request.headers.get('cookie'));

  for (const cookieName of sessionCookieNames) {
    if (cookies[cookieName]) return cookies[cookieName];

    const chunks = Object.keys(cookies)
      .filter((name) => name.startsWith(`${cookieName}.`))
      .sort((a, b) => {
        const aIndex = Number(a.split('.').pop());
        const bIndex = Number(b.split('.').pop());
        return aIndex - bIndex;
      });

    if (chunks.length > 0) {
      return chunks.map((name) => cookies[name]).join('');
    }
  }

  return null;
}

async function readSessionToken(request) {
  const rawCookieToken = readRawSessionCookie(request);
  if (rawCookieToken) return rawCookieToken;

  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) return null;

  return (
    (await getToken({ req: request, secret, raw: true, secureCookie: true })) ||
    (await getToken({ req: request, secret, raw: true, secureCookie: false }))
  );
}

export async function proxyAuthenticatedBackendRequest(request, pathname) {
  const token = await readSessionToken(request);
  if (!token) {
    return Response.json(
      { message: 'Unauthorized. Please log in first.' },
      {
        status: 401,
        headers: { 'X-VeggieMart-Auth-Proxy': '1' },
      }
    );
  }

  const incomingUrl = new URL(request.url);
  const destination = new URL(`${pathname}${incomingUrl.search}`, backendUrl);
  const headers = new Headers();

  headers.set('Authorization', `Bearer ${token}`);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const accept = request.headers.get('accept');
  if (accept) headers.set('Accept', accept);

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const response = await fetch(destination, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: 'no-store',
  });
  const responseHeaders = new Headers();
  responseHeaders.set('X-VeggieMart-Auth-Proxy', '1');
  const responseContentType = response.headers.get('content-type');
  if (responseContentType) responseHeaders.set('Content-Type', responseContentType);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
