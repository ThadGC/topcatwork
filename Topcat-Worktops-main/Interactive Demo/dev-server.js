/* Tiny static server + live reload for the Topcat prototype.
   No dependencies — run with: node dev-server.js  →  http://localhost:5500 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 5500;
const clients = new Set();

const RELOAD_SNIPPET =
  `<script>(function(){var s=new EventSource('/__reload');` +
  `s.onmessage=function(){location.reload();};` +
  `s.onerror=function(){setTimeout(function(){location.reload();},1500);};})();</script>`;

const TYPES = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',   '.json':'application/json',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',   '.webp':'image/webp', '.avif':'image/avif',
  '.mp4':'video/mp4',     '.webm':'video/webm', '.woff2':'font/woff2'
};

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/__reload') {
    res.writeHead(200, {
      'Content-Type':'text/event-stream',
      'Cache-Control':'no-cache',
      'Connection':'keep-alive'
    });
    res.write(':ok\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  const rel  = decodeURIComponent(url === '/' ? '/index.html' : url);
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }

  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not found: ' + rel); return; }
    const ext = path.extname(file).toLowerCase();
    if (ext === '.html') {
      const html = buf.toString().replace('</body>', RELOAD_SNIPPET + '</body>');
      res.writeHead(200, {'Content-Type': TYPES['.html'], 'Cache-Control':'no-store'});
      res.end(html);
    } else {
      res.writeHead(200, {'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control':'no-store'});
      res.end(buf);
    }
  });
}).listen(PORT, () => {
  console.log('Topcat prototype running → http://localhost:' + PORT);
  console.log('Watching for changes in: ' + ROOT);
});

/* watch the folder; debounce because editors write in bursts */
let timer = null;
fs.watch(ROOT, { recursive: true }, (evt, name) => {
  if (!name || name.startsWith('.') || name === 'dev-server.js') return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log('changed: ' + name + ' → reloading ' + clients.size + ' client(s)');
    for (const c of clients) c.write('data: reload\n\n');
  }, 120);
});
