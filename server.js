import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const port = Number(process.env.PORT || 5173);
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['index.html', 'styles.css'].includes(relative) && !relative.startsWith('src/')) {
      response.writeHead(404).end('Not found');
      return;
    }
    const file = resolve(root, relative);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !types[extname(file)]) {
      response.writeHead(404).end('Not found');
      return;
    }
    const data = await readFile(file);
    response.writeHead(200, {
      'Content-Type': `${types[extname(file)]}; charset=utf-8`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; worker-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'",
    }).end(data);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 400).end('Unable to serve this path');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Mathrix is running at http://127.0.0.1:${server.address().port}`));
