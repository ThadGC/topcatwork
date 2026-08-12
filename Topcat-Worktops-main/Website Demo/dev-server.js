/* Tiny static server + live reload for the Topcat website demo.
   No dependencies — run with: node dev-server.js  →  http://localhost:5501

   ⭐ COMPRESSION AND CACHING, ADDED 11 Aug 2026 (see HANDOVER §D, D109).
   The previous version sent every byte raw and stamped `Cache-Control: no-store` on
   EVERYTHING, so the client's phone re-downloaded the whole site — 1.06 MB of HTML plus
   ~2 MB of photographs — on every single load AND on every live-reload. That is most of
   "the link is slow and it jumps around".
   ⛔ This changes DELIVERY ONLY. Not one byte of any file on disk is altered, so the site
   renders identically at every width. The freeze (D91) is untouched by definition. */
const http = require('http');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = __dirname;
const PORT = process.env.PORT || 5501;   // honours an assigned port (autoPort), defaults to 5501
const clients = new Set();

/* ⛔ THE OLD SNIPPET RELOADED THE PAGE THE MOMENT THE STREAM ERRORED — 11 Aug 2026, D111.
   That is fine on a desktop beside the server and wrong on a phone across the room: the
   instant the Mac slept, or the Wi-Fi blinked, or this process restarted, every phone holding
   the page threw away a perfectly good render and asked for a page nobody was serving, so the
   customer got Safari's "can't open this page" instead of the site they were looking at.
   ⭐ Now an error means WAIT, not reload. The page it is already showing stays on screen; the
   script quietly polls until something answers again and only then reloads, so coming back to
   a backgrounded tab finds the site rather than an error. ⚠️ The backoff matters — a phone
   retrying every 1.5s for an hour is a flat battery and a hot pocket. */
/* ⚠️ AND THE STREAM ITSELF HAS TO LET GO WHEN THE TAB GOES AWAY. An open EventSource is one of
   the things that stops Chrome putting a page in the back/forward cache, so leaving it
   connected would undo the `no-cache` fix above. It is closed on `pagehide` and reopened on
   `pageshow`, which is also the moment to check whether anything changed while we were gone. */
/* ⛔ AND A RELOAD MUST KEEP THE CUSTOMER'S PLACE — D112, 11 Aug 2026.
   The client was reviewing on his phone WHILE the file was being edited, and every save fires
   this stream: measured, twelve reloads in one working session. Each one dropped him back at
   the hero, which is most of "it takes me right back to the hero section" and is indistinguish-
   able, from the far end of a phone, from the page glitching.
   ⚠️ The position is saved at the moment we decide to reload and restored on the way back, and
   the key is per-URL so a different page does not inherit it. `scrollRestoration='manual'`
   stops the browser doing its own competing restore on top of ours. */
const RELOAD_SNIPPET =
  `<script>(function(){var es,wait=1000,shut=false,K='__topcatY:'+location.pathname;` +
  `try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}` +
  `try{var y=sessionStorage.getItem(K);if(y!==null){sessionStorage.removeItem(K);` +
  /* wait for layout to exist, or the restore lands on a page that is still 0 tall */
  `addEventListener('load',function(){setTimeout(function(){` +
  `var b=document.documentElement.style.scrollBehavior;` +
  `document.documentElement.style.scrollBehavior='auto';` +
  `scrollTo(0,parseInt(y,10)||0);` +
  `document.documentElement.style.scrollBehavior=b;},60);});}}catch(e){}` +
  `function reload(){try{sessionStorage.setItem(K,String(scrollY));}catch(e){}location.reload();}` +
  `function open(){if(shut)return;es=new EventSource('/__reload');` +
  `es.onmessage=function(){reload();};` +
  `es.onopen=function(){wait=1000;};` +
  `es.onerror=function(){es.close();` +
  `wait=Math.min(wait*1.7,15000);` +           /* back off to 15s, no faster */
  `setTimeout(open,wait);};}` +
  `open();` +
  /* leaving: drop the connection so the tab stays eligible to be restored from memory */
  `addEventListener('pagehide',function(){shut=true;if(es)es.close();});` +
  /* coming back — including a restore from the back/forward cache — reconnect at once */
  `addEventListener('pageshow',function(){shut=false;wait=1000;` +
  `if(!es||es.readyState===2)open();});` +
  `document.addEventListener('visibilitychange',function(){` +
  `if(!document.hidden&&(!es||es.readyState===2)){shut=false;wait=1000;open();}});})();</script>`;

const TYPES = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',   '.json':'application/json',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',   '.webp':'image/webp', '.avif':'image/avif',
  '.mp4':'video/mp4',     '.webm':'video/webm', '.woff2':'font/woff2'
};

/* Only text compresses usefully. ⚠️ Do NOT add jpg/webp/avif/mp4/woff2 here — they are
   already compressed, and running them through gzip costs CPU to make them very slightly
   BIGGER. This is the single most common way a hand-rolled static server gets slower. */
const COMPRESSIBLE = new Set(['.html','.js','.css','.json','.svg']);

/* Assets are content-addressed by mtime+size below, so they may be held for a while and
   re-validated cheaply. ⚠️ HTML stays uncached: the live-reload snippet is injected into it
   on the way out, and a cached page would stop reloading when a file changes. */
const ASSET_CACHE = 'public, max-age=300, must-revalidate';

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
  let file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  /* directory request (…/stones/ or …/stones) → serve its index.html. Additive: '/' already
     mapped above, so the landing page at the root is completely unaffected.
     ⚠️ The example used to be /v2/, which no longer exists — the rule itself is generic and is
     what makes /stones/, /services/, /guides/ and the location folders resolve. */
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch (e) {}

  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not found: ' + rel); return; }
    const ext  = path.extname(file).toLowerCase();
    const html = ext === '.html';

    let body = buf;
    if (html) body = Buffer.from(buf.toString().replace('</body>', RELOAD_SNIPPET + '</body>'));

    const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream' };

    /* ── conditional GET for assets: the phone asks, we answer 304, nothing crosses the wire ── */
    if (!html) {
      let st = null; try { st = fs.statSync(file); } catch (e) {}
      const etag = st ? `W/"${st.size.toString(16)}-${st.mtimeMs.toString(16)}"` : null;
      headers['Cache-Control'] = ASSET_CACHE;
      if (etag) {
        headers['ETag'] = etag;
        if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); res.end(); return; }
      }
    } else {
      /* ⛔ `no-store` WAS HERE AND IT IS WHY A BACKGROUNDED PHONE TAB DIED — D111, 11 Aug 2026.
         Client: "when I go off of Chrome on my phone it stops loading in… it says can't open
         this page afterwards." ⭐ `no-store` does not merely skip the cache: it makes the page
         INELIGIBLE FOR THE BACK/FORWARD CACHE. Chrome keeps a backgrounded tab alive in memory
         and restores it instantly — unless the response said no-store, in which case the tab is
         discarded and coming back means a fresh network fetch. On a phone whose Wi-Fi has just
         re-associated, that fetch is exactly the one that fails, and Chrome shows its own error
         page instead of the site.
         ⭐ `no-cache` keeps every bit of the freshness we actually need — the browser must still
         revalidate before REUSING it for a real navigation, so an edit is never missed — while
         letting the page be held in memory and restored. ⚠️ The two names are misleading:
         `no-cache` means "revalidate", `no-store` means "never keep it at all". Only the second
         one breaks the phone. */
      headers['Cache-Control'] = 'no-cache';
      /* validator over the SERVED body (snippet included), so revalidation is a 304 and costs
         nothing when nothing has changed */
      const tag = 'W/"' + require('crypto').createHash('sha1').update(body).digest('hex').slice(0, 16) + '"';
      headers['ETag'] = tag;
      if (req.headers['if-none-match'] === tag) { res.writeHead(304, headers); res.end(); return; }
    }

    /* ── compression: brotli if the browser takes it, else gzip ── */
    const accept = String(req.headers['accept-encoding'] || '');
    if (COMPRESSIBLE.has(ext) && body.length > 1024) {
      headers['Vary'] = 'Accept-Encoding';
      try {
        if (/\bbr\b/.test(accept)) {
          /* quality 5 — near-max ratio on text at a fraction of the CPU of the default 11,
             which on a 1 MB file is the difference between ~20 ms and well over a second. */
          body = zlib.brotliCompressSync(body, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
                      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: body.length }
          });
          headers['Content-Encoding'] = 'br';
        } else if (/\bgzip\b/.test(accept)) {
          body = zlib.gzipSync(body, { level: 6 });
          headers['Content-Encoding'] = 'gzip';
        }
      } catch (e) { /* fall through uncompressed rather than fail the request */ }
    }

    headers['Content-Length'] = body.length;
    res.writeHead(200, headers);
    res.end(body);
  });
}).listen(PORT, () => {
  console.log('Topcat website demo running → http://localhost:' + PORT);
  console.log('Watching for changes in: ' + ROOT);
});

/* watch the folder; debounce because editors write in bursts.
   ⚠️ Ignore the backup files — 47 index.html.pre-*.bak sit beside the live page and a copy
   made during a session would otherwise reload the client's phone mid-look. */
let timer = null;
fs.watch(ROOT, { recursive: true }, (evt, name) => {
  if (!name || name.startsWith('.') || name === 'dev-server.js') return;
  if (/\.bak$/.test(name) || /_regress-|_debug/.test(name)) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log('changed: ' + name + ' → reloading ' + clients.size + ' client(s)');
    for (const c of clients) c.write('data: reload\n\n');
  }, 120);
});
