import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { spawn } from 'node:child_process';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(.:\/)/, '$1');
const node = process.execPath;

await new Promise((resolve, reject) => {
  const build = spawn(node, ['scripts/build.mjs'], { cwd: root, stdio: 'inherit', env: process.env });
  build.on('exit', (code) => code === 0 ? resolve() : reject(new Error('Falló la compilación')));
});

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const server = createServer(async (request, response) => {
  try {
    const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    const requested = join(root, 'dist', path === '/' ? 'index.html' : path);
    const info = await stat(requested);
    const file = info.isDirectory() ? join(requested, 'index.html') : requested;
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end('No encontrado');
  }
});

server.listen(4173, '127.0.0.1', () => console.log('Abre http://localhost:4173'));
