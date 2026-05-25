/**
 * Drop-in replacement for NextResponse.json() — works in plain Node.js.
 * Usage: json(data) | json(data, { status: 401 })
 */
export function json(data, { status = 200 } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
