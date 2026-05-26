import { getToken } from 'next-auth/jwt';

export async function getAdminSession(request) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) return null;

  const token =
    (await getToken({ req: request, secret, secureCookie: true })) ||
    (await getToken({ req: request, secret, secureCookie: false }));

  if (!token || token.role !== 'admin') return null;

  return {
    user: {
      id: token.id || token.sub,
      name: token.name,
      email: token.email,
      role: token.role,
    },
  };
}
