import { getBackendSession } from './src/session.js';

async function test() {
  const headers = new Headers();
  headers.append('cookie', 'next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..dummy');
  
  const req = new Request('http://localhost:5000/api/orders', { headers });
  
  try {
    const session = await getBackendSession(req);
    console.log('Session:', session);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
