import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(fileName) {
  const envPath = path.join(rootDir, fileName);
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const port = Number(process.env.PORT || 5000);

const routes = [
  route('/api/admin/run-recurring',           await import('./modules/recurring/admin-run.route.js')),
  route('/api/admin/subscriptions/verify',    await import('./modules/subscriptions/verify.route.js')),
  route('/api/admin/subscriptions',           await import('./modules/subscriptions/admin.route.js')),
  route('/api/categories',                    await import('./modules/categories/route.js')),
  route('/api/cron/process-subscriptions',    await import('./modules/recurring/cron.route.js')),
  route('/api/featured-products',             await import('./modules/products/featured.route.js')),
  route('/api/notifications',                 await import('./modules/notifications/route.js')),
  route('/api/orders',                        await import('./modules/orders/route.js')),
  route('/api/products/:id',                  await import('./modules/products/by-id.route.js')),
  route('/api/products',                      await import('./modules/products/route.js')),
  route('/api/seed',                          await import('./modules/users/seed.route.js')),
  route('/api/signup',                        await import('./modules/users/route.js')),
  route('/api/subscription/cancel',           await import('./modules/subscriptions/cancel.route.js')),
  route('/api/subscription/create',           await import('./modules/subscriptions/create.route.js')),
  route('/api/subscription/status',           await import('./modules/subscriptions/status.route.js')),
  route('/api/subscription/update',           await import('./modules/subscriptions/update.route.js')),
  route('/api/subscription/user',             await import('./modules/subscriptions/user.route.js')),
];

function route(pattern, handlers) {
  const names = [];
  const expression = pattern
    .replaceAll('/', '\\/')
    .replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
      names.push(name);
      return '([^/]+)';
    });

  return {
    handlers,
    matcher: new RegExp(`^${expression}\\/?$`),
    names,
  };
}

function matchRoute(pathname) {
  for (const candidate of routes) {
    const match = candidate.matcher.exec(pathname);
    if (!match) continue;

    return {
      handlers: candidate.handlers,
      params: Object.fromEntries(candidate.names.map((name, index) => [name, decodeURIComponent(match[index + 1])])),
    };
  }

  return null;
}

async function createRequest(req, url) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    return new Request(url, { headers, method: req.method });
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return new Request(url, {
    body: Buffer.concat(chunks),
    headers,
    method: req.method,
  });
}

async function sendResponse(res, response) {
  const headers = Object.fromEntries(response.headers.entries());
  headers['access-control-allow-origin'] = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
  headers['access-control-allow-credentials'] = 'true';

  res.writeHead(response.status, headers);

  if (response.body) {
    res.end(Buffer.from(await response.arrayBuffer()));
  } else {
    res.end();
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'access-control-allow-credentials': 'true',
    'access-control-allow-origin': process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    'content-type': 'application/json',
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://localhost:${port}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': req.headers['access-control-request-headers'] || 'content-type',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-allow-origin': process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
      });
      res.end();
      return;
    }

    const matched = matchRoute(requestUrl.pathname);
    if (!matched) {
      sendJson(res, 404, { message: 'Backend route not found' });
      return;
    }

    const handler = matched.handlers[req.method || 'GET'];
    if (!handler) {
      sendJson(res, 405, { message: 'Method not allowed' });
      return;
    }

    const request = await createRequest(req, requestUrl);
    const response = await handler(request, { params: Promise.resolve(matched.params) });
    await sendResponse(res, response);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { message: 'Internal Server Error', error: error.message });
  }
});

server.listen(port, () => {
  console.log(`✅ Backend server ready on http://localhost:${port}`);
});
