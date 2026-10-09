const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 5000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

http.createServer((request, response) => {
  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const topLevel = relativePath.split(/[\\/]/)[0];
  if (!['index.html', 'css', 'js', 'img'].includes(topLevel)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(root + path.sep) && filePath !== path.join(root, 'index.html')) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, info) => {
    const target = !error && info.isFile() ? filePath : path.join(root, 'index.html');
    fs.readFile(target, (readError, content) => {
      if (readError) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, { 'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream' });
      response.end(content);
    });
  });
}).listen(port, '0.0.0.0', () => {
  console.log(`Hodman is available at http://localhost:${port}`);
  console.log(`For devices on this Wi-Fi, use your computer's network address with port ${port}.`);
  console.log('Keep this window open while your friend is testing. Press Ctrl+C to stop.');
});
