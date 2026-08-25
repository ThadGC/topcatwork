<?php
/* ============================================================================================
   TOPCAT — THE FORM ENDPOINT.  25 August 2026.

   Client: "we have to link up info at topcat worktops dot co dot uk… make sure the emails are
   actually going there so we can test them", and: "all the details… laid out in this kind of
   grid… but for Topcat, it's going to be in the Topcat branding" (his SBX screenshot: a dark
   header block, a label/value grid, a MESSAGE section, then WHAT THEY DID ON THE SITE).

   ⭐ ONE FILE ANSWERS ALL 38 FORMS. `assets/tcform.js` POSTs every form here as multipart
   FormData: the enquiry card (name/email/phone/postcode/message/files/stone), the 31 SEO-page
   .qforms (name/email/phone/service) and the trade form. Fields it does not recognise are still
   printed, so a form added next month arrives complete without touching this file.

   ⭐ WHAT IT NEEDS FROM THE HOST: PHP 7.4+ and a working mail() — SiteGround has both out of the
   box. ⚠️ SiteGround's PHP defaults allow ~128 MB per POST (the front end stops at 100 MB, and
   50 MB per file). If uploads bounce, raise upload_max_filesize / post_max_size in Site Tools →
   PHP Manager. ⛔ NEVER via php_value lines in .htaccess — under FPM those 500 the whole site.

   ⭐ ATTACHMENTS: up to 12 MB rides IN the email; anything more is saved beside this file in
   `_enquiry-files/<random>/` and the email carries links instead — a 100 MB attachment would
   bounce at most mailboxes, and a bounced enquiry is a lost customer.

   ⚠️ THE THANK-YOU AUTOREPLY IS DELIBERATELY OFF. His words: "that will get sent from another
   email that we create. So I don't have to do that yet." Set $SEND_AUTOREPLY = true and fill
   $AUTOREPLY_FROM when he has made the address — the block at the bottom is already written.
   ============================================================================================ */

$TO             = 'info@topcatworktops.co.uk';
$FROM           = 'website@topcatworktops.co.uk';   // must be on the site's own domain for SPF
$FROM_NAME      = 'Topcat Worktops website';
$SEND_AUTOREPLY = false;                            // ⚠️ off on his instruction — see header
$AUTOREPLY_FROM = '';                               // the address he will create

$ATTACH_MAX  = 12 * 1024 * 1024;    // total that travels inside the email
$FILE_MAX    = 50 * 1024 * 1024;    // per file — TC_UP.MAXB's own number
$TOTAL_MAX   = 100 * 1024 * 1024;   // matches MAX_POST in tcform.js
$EXT_OK      = ['pdf','jpg','jpeg','png','heic','heif','webp','gif','doc','docx','dwg','dxf'];

/* ── the palette is the site's own ─────────────────────────────────────────────────────────── */
$INK  = '#0B0B0E';   // header ground
$BONE = '#F4F1EA';   // page ground / alternating row
$GOLD = '#C6A664';   // the champagne — small caps accents only, never a top border (§2 rule 10)
$TEXT = '#1B1B18';
$MUTE = '#6E6A60';

header('Content-Type: application/json; charset=utf-8');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405); echo json_encode(['ok' => false, 'error' => 'POST only']); exit;
}

/* one clean reader: trimmed, length-capped, header-injection-proof */
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
$message  = isset($_POST['message']) && is_string($_POST['message'])
          ? mb_substr(trim($_POST['message']), 0, 8000) : '';

/* the same bar tcform.js sets: a name, and at least one way to answer */
if (mb_strlen($name) < 2 || ($email === '' && $phone === '')) {
  http_response_code(422); echo json_encode(['ok' => false, 'error' => 'missing details']); exit;
}
$emailOK = filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';

/* ── attachments: validate, then attach or store ───────────────────────────────────────────── */
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
$stored = [];            // [name, url] when the batch is too big to attach
$attach = [];            // [name, path] when it is not
if ($files) {
  if ($totalB <= $ATTACH_MAX) {
    foreach ($files as $f) $attach[] = $f;
  } else {
    $root = __DIR__ . '/_enquiry-files';
    if (!is_dir($root)) {
      @mkdir($root, 0755, true);
      /* no listing, and nothing in here ever executes — uploads are whitelist-renamed anyway */
      @file_put_contents($root . '/.htaccess', "Options -Indexes\nRemoveHandler .php .phtml .php5 .php7\nRemoveType .php .phtml .php5 .php7\n");
    }
    $tok = bin2hex(random_bytes(8));
    $dir = $root . '/' . $tok;
    @mkdir($dir, 0755, true);
    $base = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'topcatworktops.co.uk') . '/_enquiry-files/' . $tok . '/';
    foreach ($files as $f) {
      $safe = preg_replace('/[^A-Za-z0-9._ -]/', '_', basename($f['name']));
      $safe = preg_replace('/\.[^.]+$/', '', $safe) . '.' . $f['ext'];   // extension from the whitelist
      if (move_uploaded_file($f['tmp'], $dir . '/' . $safe)) {
        $stored[] = ['name' => $f['name'], 'size' => $f['size'], 'url' => $base . rawurlencode($safe)];
      }
    }
  }
}

/* ── the journey and the estimate, decoded defensively ─────────────────────────────────────── */
$journey  = json_decode($_POST['journey']  ?? 'null', true);
$estimate = json_decode($_POST['estimate'] ?? 'null', true);
$events   = (is_array($journey) && isset($journey['ev']) && is_array($journey['ev']))
          ? array_slice($journey['ev'], -100) : [];

function ev_line($e) {
  $k = (string)($e['k'] ?? ''); $v = (string)($e['v'] ?? '');
  $s = (string)($e['s'] ?? ''); $p = (string)($e['p'] ?? '');
  switch ($k) {
    case 'Viewed':             return 'Viewed ' . $v;
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

/* consecutive duplicates (a reload, a rage-click) collapse to one line */
$lines = []; $prev = '';
foreach ($events as $e) {
  $t = ev_line($e);
  if ($t === '' || $t === $prev) continue;
  $at = isset($e['at']) ? date('H:i', (int)($e['at'] / 1000)) : '';
  $lines[] = [$at, $t];
  $prev = $t;
}

/* ── the email, in the SBX grid, wearing Topcat's colours ──────────────────────────────────── */
function row($label, $value, $i) {
  global $BONE, $TEXT, $MUTE;
  $bg = $i % 2 ? '#FFFFFF' : '#FAF8F3';
  return '<tr><td style="padding:11px 18px;background:' . $bg . ';color:' . $MUTE . ';font:600 11px/1.5 Arial,Helvetica,sans-serif;letter-spacing:0.08em;text-transform:uppercase;width:34%;vertical-align:top;border-bottom:1px solid #EFEBE2">' . h($label) . '</td>'
       . '<td style="padding:11px 18px;background:' . $bg . ';color:' . $TEXT . ';font:400 14px/1.55 Arial,Helvetica,sans-serif;vertical-align:top;border-bottom:1px solid #EFEBE2">' . $value . '</td></tr>';
}
function section($t) {
  global $GOLD;
  return '<tr><td colspan="2" style="padding:26px 18px 8px;background:#FFFFFF;color:' . $GOLD . ';font:700 12px/1.4 Arial,Helvetica,sans-serif;letter-spacing:0.16em;text-transform:uppercase">' . h($t) . '</td></tr>';
}

$i = 0; $rows = '';
$rows .= row('Name', h($name), $i++);
if ($email)    $rows .= row('Email',    '<a href="mailto:' . h($email) . '" style="color:#8A6D3B">' . h($email) . '</a>', $i++);
if ($phone)    $rows .= row('Phone',    '<a href="tel:' . h(preg_replace('/[^0-9+]/', '', $phone)) . '" style="color:#8A6D3B">' . h($phone) . '</a>', $i++);
if ($postcode) $rows .= row('Postcode', h($postcode), $i++);
if ($service)  $rows .= row('Service',  h($service), $i++);
if ($stone)    $rows .= row('Stone',    h($stone), $i++);
if ($stoneLnk) $rows .= row('Stone link', h($stoneLnk), $i++);
/* anything a future form adds arrives here rather than vanishing */
$known = ['name','email','phone','postcode','service','stone','stone_link','message','page','journey','estimate','sent_at'];
foreach ($_POST as $k => $v) {
  if (in_array($k, $known, true) || !is_string($v) || trim($v) === '') continue;
  $rows .= row(ucfirst(str_replace('_', ' ', mb_substr($k, 0, 40))), h(mb_substr(trim($v), 0, 500)), $i++);
}
if ($page) $rows .= row('Sent from', h($page), $i++);

if ($message !== '') {
  $rows .= section('Message');
  $rows .= '<tr><td colspan="2" style="padding:6px 18px 16px;background:#FFFFFF;color:' . $TEXT . ';font:400 14px/1.65 Arial,Helvetica,sans-serif">' . nl2br(h($message)) . '</td></tr>';
}

if (is_array($estimate) && !empty($estimate['stone'])) {
  $rows .= section('Their estimate');
  $j = 0;
  $rows .= row('Material', h($estimate['mat'] ?? ''), $j++);
  $rows .= row('Stone', h($estimate['stone']), $j++);
  if (!empty($estimate['poa'])) {
    $rows .= row('Price', 'Priced by hand (POA path)', $j++);
  } else {
    if (!empty($estimate['pieces']) && is_array($estimate['pieces']))
      $rows .= row('Pieces', h(implode(' · ', array_map('strval', array_slice($estimate['pieces'], 0, 12)))), $j++);
    if (isset($estimate['slabs']))  $rows .= row('Slabs', h((string)$estimate['slabs']) . (empty($estimate['island']) ? '' : ' · with island'), $j++);
    if (!empty($estimate['extras']) && is_array($estimate['extras']))
      $rows .= row('Extras', h(implode(' · ', array_map('strval', $estimate['extras']))), $j++);
    if (isset($estimate['lo'], $estimate['hi']))
      $rows .= row('Range shown', '£' . number_format((float)$estimate['lo']) . ' – £' . number_format((float)$estimate['hi']), $j++);
  }
}

if ($stored) {
  $rows .= section('Their files (too large to attach — download links)');
  $j = 0;
  foreach ($stored as $f)
    $rows .= row($f['name'], '<a href="' . h($f['url']) . '" style="color:#8A6D3B">' . h($f['url']) . '</a> · ' . round($f['size'] / 1048576, 1) . ' MB', $j++);
} elseif ($attach) {
  $rows .= section('Their files (attached)');
  $j = 0;
  foreach ($attach as $f) $rows .= row(h($f['name']), round($f['size'] / 1048576, 1) . ' MB', $j++);
}

if ($lines) {
  $rows .= section('What they did on the site');
  $j = 0;
  foreach ($lines as $l)
    $rows .= row($l[0] !== '' ? $l[0] : '·', h($l[1]), $j++);
}

$html = '<!doctype html><html><body style="margin:0;padding:0;background:' . $BONE . '">'
  . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' . $BONE . ';padding:26px 0"><tr><td align="center">'
  . '<table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:620px;max-width:94%;background:#FFFFFF;border-collapse:collapse">'
  . '<tr><td colspan="2" style="background:' . $INK . ';padding:26px 18px 22px">'
  .   '<div style="color:#FFFFFF;font:400 21px/1.3 Georgia,\'Times New Roman\',serif;letter-spacing:0.14em">TOPCAT WORKTOPS</div>'
  .   '<div style="color:' . $GOLD . ';font:600 10.5px/1.4 Arial,Helvetica,sans-serif;letter-spacing:0.22em;margin-top:7px">NEW ENQUIRY FROM THE WEBSITE</div>'
  . '</td></tr>'
  . $rows
  . '<tr><td colspan="2" style="padding:18px;background:#FFFFFF;color:' . $MUTE . ';font:400 11px/1.6 Arial,Helvetica,sans-serif;border-top:1px solid #EFEBE2">Sent ' . date('j M Y, H:i') . ' from topcatworktops.co.uk' . ($emailOK ? ' · reply goes straight to the customer' : '') . '</td></tr>'
  . '</table></td></tr></table></body></html>';

/* the plain half — some clients preview with it, and it is the accessible fallback */
$plain = "TOPCAT WORKTOPS — new enquiry from the website\n\n"
  . "Name: $name\n" . ($email ? "Email: $email\n" : '') . ($phone ? "Phone: $phone\n" : '')
  . ($postcode ? "Postcode: $postcode\n" : '') . ($service ? "Service: $service\n" : '')
  . ($stone ? "Stone: $stone\n" : '') . ($page ? "Sent from: $page\n" : '')
  . ($message !== '' ? "\nMESSAGE\n$message\n" : '');
if ($lines) {
  $plain .= "\nWHAT THEY DID ON THE SITE\n";
  foreach ($lines as $l) $plain .= ($l[0] ? $l[0] . '  ' : '') . $l[1] . "\n";
}
foreach ($stored as $f) $plain .= "\nFile: " . $f['name'] . ' — ' . $f['url'];

/* ── assemble MIME: mixed(alternative(plain,html), attachments…) ───────────────────────────── */
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

$subject = 'New enquiry from the Topcat website — ' . $name . ($postcode ? ' (' . $postcode . ')' : '');
$headers = "From: " . mb_encode_mimeheader($FROM_NAME, 'UTF-8') . " <$FROM>\r\n"
         . ($emailOK ? "Reply-To: $emailOK\r\n" : '')
         . "MIME-Version: 1.0\r\nContent-Type: $ctype\r\nX-Mailer: topcat-send-php";

$sent = @mail($TO, mb_encode_mimeheader($subject, 'UTF-8'), $body, $headers, '-f' . $FROM);

if (!$sent) {
  /* mail() said no — keep the enquiry on disk so nothing is lost, then be honest with the page */
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
