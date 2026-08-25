<?php
/* ============================================================================================
   TOPCAT — THE FORM ENDPOINT.  25 August 2026, v2 the same day.

   v1: client's SBX screenshot as the layout spec — a dark header, a label/value grid, MESSAGE,
   then WHAT THEY DID ON THE SITE. v2, on his review of the preview: *"redesign it to look
   neater and easier to read. Divide the two sides so that it's not just all in one line…
   we must be able to say if it was sent from mobile or desktop or tablet… any other data we
   can possibly show like how long they spend on the website… clearly say which form they
   submitted."*

   ⭐ ONE FILE ANSWERS ALL 38 FORMS — `assets/tcform.js` POSTs every form here as multipart
   FormData and now also sends: `form_name` (Enquiry card / Quick enquiry form / Trade account
   form), `device` (the SITE'S OWN three bands: phone ≤720 / tablet ≤1120 / desktop), `screen`,
   `page_title`, the `journey` trail and the latest `estimate`. Unknown future fields still print.

   ⭐ THE LOGO IS DELIBERATELY NOT AN IMAGE. His words: "whatever is easiest and sends easiest."
   Most mail clients block remote images until the reader opts in, Gmail strips data: URIs, and
   CID attachments bloat every enquiry — a styled text header is the one version that always
   arrives looking right.

   ⭐ WHAT IT NEEDS FROM THE HOST: PHP 7.4+ and a working mail() — SiteGround has both. ⚠️ Raise
   upload limits only in Site Tools → PHP Manager. ⛔ php_value in .htaccess 500s under FPM.

   ⭐ ATTACHMENTS: ≤12 MB total rides IN the email; more is saved to `_enquiry-files/<random>/`
   and linked. Per-file 50 MB (TC_UP), total 100 MB (tcform guard).

   ⚠️ THE THANK-YOU AUTOREPLY IS OFF on his instruction ("that will get sent from another email
   that we create") — $SEND_AUTOREPLY below, already written.
   ============================================================================================ */

$TO             = 'info@topcatworktops.co.uk';
$FROM           = 'website@topcatworktops.co.uk';   // must be on the site's own domain for SPF
$FROM_NAME      = 'Topcat Worktops website';
$SEND_AUTOREPLY = false;                            // ⚠️ off on his instruction — see header
$AUTOREPLY_FROM = '';                               // the address he will create

$ATTACH_MAX  = 12 * 1024 * 1024;
$FILE_MAX    = 50 * 1024 * 1024;
$TOTAL_MAX   = 100 * 1024 * 1024;
$EXT_OK      = ['pdf','jpg','jpeg','png','heic','heif','webp','gif','doc','docx','dwg','dxf'];

/* ── the palette is the site's own ─────────────────────────────────────────────────────────── */
$INK   = '#0B0B0E';
$BONE  = '#F4F1EA';   // the label column's ground — one side of the divide
$SEAM  = '#E3DCCB';   // the vertical rule between the two sides
$ROWLN = '#EFEAE0';   // the quiet line under each row
$GOLD  = '#C6A664';
$TEXT  = '#1B1B18';
$MUTE  = '#8A857A';
$LINK  = '#8A6D3B';

header('Content-Type: application/json; charset=utf-8');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405); echo json_encode(['ok' => false, 'error' => 'POST only']); exit;
}

function fld($k, $max = 4000) {
  $v = isset($_POST[$k]) && is_string($_POST[$k]) ? trim($_POST[$k]) : '';
  return mb_substr(str_replace(["\r", "\n"], ' ', $v), 0, $max);
}
function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

$name     = fld('name', 120);
$email    = fld('email', 200);
$phone    = fld('phone', 60);
$postcode = fld('postcode', 20);
$service  = fld('service', 120);
$stone    = fld('stone', 160);
$stoneLnk = fld('stone_link', 300);
$page     = fld('page', 200);
$pageTtl  = fld('page_title', 90);
$formName = fld('form_name', 40);
$device   = fld('device', 12);
$screen   = fld('screen', 16);
$message  = isset($_POST['message']) && is_string($_POST['message'])
          ? mb_substr(trim($_POST['message']), 0, 8000) : '';

if (mb_strlen($name) < 2 || ($email === '' && $phone === '')) {
  http_response_code(422); echo json_encode(['ok' => false, 'error' => 'missing details']); exit;
}
$emailOK = filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';

/* which page family the form sat on, in words the client uses */
function page_label($p) {
  if ($p === '/' || $p === '/index.html') return 'Home page';
  $map = ['/contact/' => 'Contact page', '/trade/' => 'Trade page', '/about/' => 'About page',
          '/projects/' => 'Projects page', '/estimate/' => 'Estimate page'];
  foreach ($map as $k => $v) if (strpos($p, $k) === 0) return $v;
  foreach (['/services/' => 'Service page', '/stones/' => 'Stone page', '/materials/' => 'Materials page',
            '/guides/' => 'Guide page', '/worktops/' => 'Area page'] as $k => $v)
    if (strpos($p, $k) === 0) return $v;
  return $p !== '' ? $p : 'the website';
}
$whereLine = page_label($page) . ($formName ? ' · ' . $formName : '');
$devLine   = $device ? ('Sent from a ' . $device . ($screen ? ' (' . $screen . ')' : '')) : '';

/* ── attachments ───────────────────────────────────────────────────────────────────────────── */
$files = []; $totalB = 0;
foreach ($_FILES as $f) {
  if (!is_array($f) || ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) continue;
  $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, $EXT_OK, true)) continue;
  if ($f['size'] > $FILE_MAX) continue;
  $totalB += $f['size'];
  if ($totalB > $TOTAL_MAX) break;
  $files[] = ['tmp' => $f['tmp_name'], 'name' => $f['name'], 'size' => $f['size'], 'ext' => $ext];
}
$stored = []; $attach = [];
if ($files) {
  if ($totalB <= $ATTACH_MAX) {
    foreach ($files as $f) $attach[] = $f;
  } else {
    $root = __DIR__ . '/_enquiry-files';
    if (!is_dir($root)) {
      @mkdir($root, 0755, true);
      @file_put_contents($root . '/.htaccess', "Options -Indexes\nRemoveHandler .php .phtml .php5 .php7\nRemoveType .php .phtml .php5 .php7\n");
    }
    $tok = bin2hex(random_bytes(8));
    $dir = $root . '/' . $tok;
    @mkdir($dir, 0755, true);
    $base = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'topcatworktops.co.uk') . '/_enquiry-files/' . $tok . '/';
    foreach ($files as $f) {
      $safe = preg_replace('/[^A-Za-z0-9._ -]/', '_', basename($f['name']));
      $safe = preg_replace('/\.[^.]+$/', '', $safe) . '.' . $f['ext'];
      if (move_uploaded_file($f['tmp'], $dir . '/' . $safe)) {
        $stored[] = ['name' => $f['name'], 'size' => $f['size'], 'url' => $base . rawurlencode($safe)];
      }
    }
  }
}

/* ── the journey, decoded and DIGESTED ─────────────────────────────────────────────────────────
   ⭐ v2 (client): "how long they spend on the website… what pages they went to… the more data
   we have, the better." The trail already holds every timestamp; the digest is computed here,
   server-side, so the tracker stays tiny: visits (events >30 min apart start a new one), total
   time on site, per-page dwell (time to the NEXT event of any kind, capped at 30 min — the
   `Left` marker tcform writes on pagehide closes the last page honestly). */
$journey  = json_decode($_POST['journey']  ?? 'null', true);
$estimate = json_decode($_POST['estimate'] ?? 'null', true);
$events   = (is_array($journey) && isset($journey['ev']) && is_array($journey['ev']))
          ? array_slice($journey['ev'], -150) : [];
$events   = array_values(array_filter($events, fn($e) => is_array($e) && isset($e['at'])));
usort($events, fn($a, $b) => ($a['at'] <=> $b['at']));

$GAP = 30 * 60 * 1000;
$visits = 0; $spentMs = 0; $spanStart = null; $prevAt = null;
foreach ($events as $e) {
  $at = (int)$e['at'];
  if ($prevAt === null || $at - $prevAt > $GAP) { $visits++; if ($spanStart !== null) $spentMs += $prevAt - $spanStart; $spanStart = $at; }
  $prevAt = $at;
}
if ($spanStart !== null) $spentMs += $prevAt - $spanStart;

function human_ms($ms) {
  $s = (int)round($ms / 1000);
  if ($s < 60) return $s . ' sec';
  if ($s < 3600) return round($s / 60) . ' min';
  return floor($s / 3600) . ' h ' . round(($s % 3600) / 60) . ' min';
}

/* per-page dwell: a Viewed event owns the time to the next event, capped at the visit gap */
$pageDwell = []; $pageOrder = [];
for ($i = 0; $i < count($events); $i++) {
  $e = $events[$i];
  if (($e['k'] ?? '') !== 'Viewed') continue;
  $path = (string)($e['v'] ?? '');
  if ($path === '') continue;
  $d = 0;
  if (isset($events[$i + 1])) $d = min((int)$events[$i + 1]['at'] - (int)$e['at'], $GAP);
  if (!isset($pageDwell[$path])) { $pageDwell[$path] = 0; $pageOrder[] = $path; }
  $pageDwell[$path] += max($d, 0);
}
$firstSeen = (is_array($journey) && isset($journey['started']))
           ? date('j M, H:i', (int)($journey['started'] / 1000)) : '';
$cameFrom = '';
foreach ($events as $e) if (($e['k'] ?? '') === 'Arrived') { $cameFrom = (string)$e['v']; break; }

function ev_line($e) {
  $k = (string)($e['k'] ?? ''); $v = (string)($e['v'] ?? '');
  $s = (string)($e['s'] ?? ''); $p = (string)($e['p'] ?? '');
  switch ($k) {
    case 'Viewed':             return 'Viewed ' . $v;
    case 'Left':               return 'Left ' . $v;
    case 'Arrived':            return 'Arrived from ' . ($v === 'direct' ? 'a direct visit' : $v);
    case 'Estimator material': return 'Estimator: switched to ' . $v;
    case 'Estimator stone':    return 'Estimator: chose ' . $v;
    case 'Clicked':
      $t = 'Clicked "' . $v . '"';
      if ($s !== '') $t .= ' in ' . $s;
      if ($p !== '') $t .= ' on ' . $p;
      return $t;
    default: return trim($k . ' ' . $v);
  }
}
$lines = []; $prev = '';
foreach ($events as $e) {
  $t = ev_line($e);
  if ($t === '' || $t === $prev) continue;
  $lines[] = [date('H:i', (int)($e['at'] / 1000)), $t];
  $prev = $t;
}

/* ── the email — v2: the two sides visibly divided ─────────────────────────────────────────── */
function row($label, $value) {
  global $BONE, $SEAM, $ROWLN, $TEXT, $MUTE;
  return '<tr>'
    . '<td style="padding:13px 18px;background:' . $BONE . ';border-right:1px solid ' . $SEAM . ';border-bottom:1px solid ' . $ROWLN . ';color:' . $MUTE . ';font:600 10.5px/1.6 Arial,Helvetica,sans-serif;letter-spacing:0.1em;text-transform:uppercase;width:31%;vertical-align:top">' . h($label) . '</td>'
    . '<td style="padding:13px 18px;background:#FFFFFF;border-bottom:1px solid ' . $ROWLN . ';color:' . $TEXT . ';font:400 14.5px/1.6 Arial,Helvetica,sans-serif;vertical-align:top">' . $value . '</td></tr>';
}
function section($t) {
  global $GOLD, $ROWLN;
  return '<tr><td colspan="2" style="padding:30px 18px 10px;background:#FFFFFF;border-bottom:1px solid ' . $ROWLN . ';color:' . $GOLD . ';font:700 12px/1.4 Arial,Helvetica,sans-serif;letter-spacing:0.18em;text-transform:uppercase">' . h($t) . '</td></tr>';
}
function wide($html_) {
  global $TEXT;
  return '<tr><td colspan="2" style="padding:14px 18px 18px;background:#FFFFFF;color:' . $TEXT . ';font:400 14.5px/1.7 Arial,Helvetica,sans-serif">' . $html_ . '</td></tr>';
}

$rows = '';
$rows .= row('Name', h($name));
if ($email)    $rows .= row('Email',    '<a href="mailto:' . h($email) . '" style="color:' . $LINK . '">' . h($email) . '</a>');
if ($phone)    $rows .= row('Phone',    '<a href="tel:' . h(preg_replace('/[^0-9+]/', '', $phone)) . '" style="color:' . $LINK . '">' . h($phone) . '</a>');
if ($postcode) $rows .= row('Postcode', h($postcode));
if ($service)  $rows .= row('Service',  h($service));
if ($stone)    $rows .= row('Stone',    h($stone));
if ($stoneLnk) $rows .= row('Stone link', '<a href="' . h($stoneLnk) . '" style="color:' . $LINK . '">' . h($stoneLnk) . '</a>');
$known = ['name','email','phone','postcode','service','stone','stone_link','message','page',
          'page_title','form_name','device','screen','journey','estimate','sent_at'];
foreach ($_POST as $k => $v) {
  if (in_array($k, $known, true) || !is_string($v) || trim($v) === '') continue;
  $rows .= row(ucfirst(str_replace('_', ' ', mb_substr($k, 0, 40))), h(mb_substr(trim($v), 0, 500)));
}

if ($message !== '') {
  $rows .= section('Message');
  $rows .= wide(nl2br(h($message)));
}

if (is_array($estimate) && !empty($estimate['stone'])) {
  $rows .= section('Their estimate');
  $rows .= row('Material', h($estimate['mat'] ?? ''));
  $rows .= row('Stone', h($estimate['stone']));
  if (!empty($estimate['poa'])) {
    $rows .= row('Price', 'Priced by hand (POA path)');
  } else {
    if (!empty($estimate['pieces']) && is_array($estimate['pieces']))
      $rows .= row('Pieces', implode('<br>', array_map(fn($x) => h((string)$x), array_slice($estimate['pieces'], 0, 12))));
    if (isset($estimate['slabs']))  $rows .= row('Slabs', h((string)$estimate['slabs']) . (empty($estimate['island']) ? '' : ' · with island'));
    if (!empty($estimate['extras']) && is_array($estimate['extras']))
      $rows .= row('Extras', h(implode(' · ', array_map('strval', $estimate['extras']))));
    if (isset($estimate['lo'], $estimate['hi']))
      $rows .= row('Range shown', '<b>£' . number_format((float)$estimate['lo']) . ' – £' . number_format((float)$estimate['hi']) . '</b>');
  }
}

if ($stored) {
  $rows .= section('Their files — too large to attach, download links');
  foreach ($stored as $f)
    $rows .= row($f['name'], '<a href="' . h($f['url']) . '" style="color:' . $LINK . '">Download</a> · ' . round($f['size'] / 1048576, 1) . ' MB');
} elseif ($attach) {
  $rows .= section('Their files — attached');
  foreach ($attach as $f) $rows .= row($f['name'], round($f['size'] / 1048576, 1) . ' MB');
}

/* the glance: every number the trail can honestly give */
if ($events) {
  $rows .= section('Their visit at a glance');
  if ($device)    $rows .= row('Device', ucfirst($device) . ($screen ? ' · ' . h($screen) : ''));
  if ($firstSeen) $rows .= row('First seen', h($firstSeen));
  $rows .= row('Visits', $visits . ($visits === 1 ? ' visit' : ' visits'));
  if ($spentMs > 0) $rows .= row('Time on site', h(human_ms($spentMs)) . ($visits > 1 ? ' across the visits' : ''));
  $rows .= row('Pages viewed', count($pageOrder) . ' ' . (count($pageOrder) === 1 ? 'page' : 'different pages'));
  if ($cameFrom) $rows .= row('Came from', h($cameFrom === 'direct' ? 'a direct visit' : $cameFrom));

  if ($pageOrder) {
    $rows .= section('Pages they viewed');
    foreach (array_slice($pageOrder, 0, 14) as $path)
      $rows .= row($path === '/' ? '/ (home)' : $path,
                   $pageDwell[$path] >= 5000 ? 'about ' . human_ms($pageDwell[$path]) : 'a glance');
    if (count($pageOrder) > 14) $rows .= row('…', '+' . (count($pageOrder) - 14) . ' more');
  }

  $rows .= section('What they did, step by step');
  foreach (array_slice($lines, -60) as $l) $rows .= row($l[0], h($l[1]));
}

$html = '<!doctype html><html><body style="margin:0;padding:0;background:' . $BONE . '">'
  . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' . $BONE . ';padding:30px 0"><tr><td align="center">'
  . '<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:94%;background:#FFFFFF;border-collapse:collapse;border:1px solid ' . $SEAM . '">'
  . '<tr><td colspan="2" style="background:' . $INK . ';padding:28px 18px 22px">'
  .   '<div style="color:#FFFFFF;font:400 22px/1.3 Georgia,\'Times New Roman\',serif;letter-spacing:0.15em">TOPCAT WORKTOPS</div>'
  .   '<div style="color:' . $GOLD . ';font:600 10.5px/1.4 Arial,Helvetica,sans-serif;letter-spacing:0.24em;margin-top:8px">NEW ENQUIRY FROM THE WEBSITE</div>'
  .   '<div style="color:#B9B2A4;font:400 12.5px/1.5 Arial,Helvetica,sans-serif;margin-top:12px">'
  .     h($whereLine) . ($devLine ? '<span style="color:#6E6A60"> &nbsp;·&nbsp; </span>' . h($devLine) : '') . '</div>'
  . '</td></tr>'
  . $rows
  . '<tr><td colspan="2" style="padding:18px;background:' . $BONE . ';color:' . $MUTE . ';font:400 11px/1.6 Arial,Helvetica,sans-serif;border-top:1px solid ' . $SEAM . '">Sent ' . date('j M Y, H:i') . ' from topcatworktops.co.uk' . ($emailOK ? ' · reply goes straight to the customer' : '') . '</td></tr>'
  . '</table></td></tr></table></body></html>';

$plain = "TOPCAT WORKTOPS — new enquiry from the website\n"
  . $whereLine . ($devLine ? " · $devLine" : '') . "\n\n"
  . "Name: $name\n" . ($email ? "Email: $email\n" : '') . ($phone ? "Phone: $phone\n" : '')
  . ($postcode ? "Postcode: $postcode\n" : '') . ($service ? "Service: $service\n" : '')
  . ($stone ? "Stone: $stone\n" : '')
  . ($message !== '' ? "\nMESSAGE\n$message\n" : '');
if ($events) {
  $plain .= "\nVISIT AT A GLANCE\n";
  if ($device) $plain .= "Device: $device" . ($screen ? " ($screen)" : '') . "\n";
  if ($firstSeen) $plain .= "First seen: $firstSeen\n";
  $plain .= "Visits: $visits\nTime on site: " . human_ms($spentMs) . "\nPages viewed: " . count($pageOrder) . "\n";
  $plain .= "\nWHAT THEY DID\n";
  foreach (array_slice($lines, -60) as $l) $plain .= $l[0] . '  ' . $l[1] . "\n";
}
foreach ($stored as $f) $plain .= "\nFile: " . $f['name'] . ' — ' . $f['url'];

/* ── MIME ──────────────────────────────────────────────────────────────────────────────────── */
$bAlt = 'alt_' . bin2hex(random_bytes(10));
$bMix = 'mix_' . bin2hex(random_bytes(10));
$alt  = "--$bAlt\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
      . chunk_split(base64_encode($plain))
      . "--$bAlt\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
      . chunk_split(base64_encode($html))
      . "--$bAlt--\r\n";
if ($attach) {
  $body = "--$bMix\r\nContent-Type: multipart/alternative; boundary=\"$bAlt\"\r\n\r\n" . $alt;
  foreach ($attach as $f) {
    $fn = str_replace('"', '', $f['name']);
    $body .= "--$bMix\r\nContent-Type: application/octet-stream; name=\"$fn\"\r\n"
           . "Content-Disposition: attachment; filename=\"$fn\"\r\nContent-Transfer-Encoding: base64\r\n\r\n"
           . chunk_split(base64_encode(file_get_contents($f['tmp'])));
  }
  $body .= "--$bMix--\r\n";
  $ctype = "multipart/mixed; boundary=\"$bMix\"";
} else {
  $body  = $alt;
  $ctype = "multipart/alternative; boundary=\"$bAlt\"";
}

$subject = 'New enquiry — ' . $name . ($postcode ? ' (' . $postcode . ')' : '')
         . ' · ' . page_label($page) . ($device ? ' · ' . $device : '');
$headers = "From: " . mb_encode_mimeheader($FROM_NAME, 'UTF-8') . " <$FROM>\r\n"
         . ($emailOK ? "Reply-To: $emailOK\r\n" : '')
         . "MIME-Version: 1.0\r\nContent-Type: $ctype\r\nX-Mailer: topcat-send-php";

$sent = @mail($TO, mb_encode_mimeheader($subject, 'UTF-8'), $body, $headers, '-f' . $FROM);

if (!$sent) {
  $keep = __DIR__ . '/_enquiry-files/.failed';
  if (!is_dir($keep)) { @mkdir($keep, 0755, true); @file_put_contents($keep . '/.htaccess', "Require all denied\n"); }
  @file_put_contents($keep . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.json',
    json_encode(['post' => $_POST, 'stored' => $stored], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
  http_response_code(500); echo json_encode(['ok' => false, 'error' => 'mail failed']); exit;
}

/* ⚠️ THE AUTOREPLY, WRITTEN AND SWITCHED OFF — his instruction, see the header.
if ($SEND_AUTOREPLY && $emailOK && $AUTOREPLY_FROM) {
  $r = "Thank you $name, we have your enquiry.\n\nSomeone from the team will come back to you "
     . "within one working day. If it is urgent, call us free on 0800 098 2812.\n\nTopcat Worktops";
  @mail($emailOK, 'Thank you — we have your enquiry',
        $r, "From: Topcat Worktops <$AUTOREPLY_FROM>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8",
        '-f' . $AUTOREPLY_FROM);
}
*/

echo json_encode(['ok' => true]);
