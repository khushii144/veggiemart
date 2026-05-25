import { getToken } from 'next-auth/jwt';

export async function getBackendSession(req) {
  try {
    // Safely parse headers into a plain object, ensuring all keys are lowercase
    const headers = {};
    for (const [key, value] of req.headers.entries()) {
      headers[key.toLowerCase()] = value;
    }

    // Create a mock NextApiRequest-like object that next-auth/jwt understands perfectly
    const mockReq = {
      headers,
      cookies: headers.cookie ? Object.fromEntries(
        headers.cookie.split(';').map(c => {
          const [k, ...v] = c.trim().split('=');
          return [k, v.join('=')];
        })
      ) : {}
    };

    const token = await getToken({
      req: mockReq,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: false, // Explicitly tell it to look for the non-secure local cookie
    });

    if (!token) {
      return null;
    }

    return {
      user: {
        id: token.id || token.sub,
        name: token.name,
        email: token.email,
        role: token.role,
      },
    };
  } catch (err) {
    console.error('[Auth] Error decoding token:', err);
    return null;
  }
}
