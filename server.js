// Local development server: serves this folder at http://localhost:3000
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 3000;
const root = path.dirname(fileURLToPath(import.meta.url));

// Browsers refuse to run ES modules unless .js comes with a JavaScript type.
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
};

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    const file = path.join(root, decodeURIComponent(pathname === '/' ? '/index.html' : pathname));

    // Refuse paths that escape the project folder, e.g. /..%2f..%2fetc/passwd
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache', // always load the latest code after an edit
    });
    res.end(data);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Running at http://localhost:${PORT}`);
});