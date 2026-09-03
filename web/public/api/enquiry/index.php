<?php
/* ==========================================================================
   THE ENQUIRY ENDPOINT — `POST /api/enquiry`, multipart/form-data.

   WHY IT IS PHP. The site is a Next application, but the LIVE one is a static
   export on SiteGround's Apache. `app/api/enquiry/route.ts` is a Node route
   handler and there is no Node on that box, so every form on the live domain
   was posting into thin air. This file is that route's Apache twin: same URL,
   same field names, same JSON contract, so the client-side code in
   `src/lib/form/payload.ts` needs no change and does not know which one
   answered.

   ⚠️ KEEP THE TWO IN STEP. If the validation rules or the JSON shape change in
   route.ts, change them here in the same edit, or the live site and the Vercel
   copy will disagree about what a valid enquiry is.

   THE NOTIFICATION EMAIL IS DELIBERATELY THE ONE THE CLIENT ALREADY READS —
   same palette, same label column, same row order as the legacy `send.php`
   (still at ~/Documents/TOPCAT WORKTOPS/send.php) and as `src/lib/mail/
   compose.ts`, which is itself a port of it. The autoreply is `composeAutoReply`
   from that file, rendered in PHP.

   ⛔ CREDENTIALS LIVE IN `config.php`, WHICH IS NOT IN THE REPOSITORY.
   See config.example.php for why. This file holds no secrets and is safe to
   commit; that one is not.
   ========================================================================== */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* --- the JSON contract, in one place ------------------------------------- */
function tc_out(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
/** The one wording the visitor sees when delivery fails. Matches route.ts. */
const TC_FAIL = 'We could not send that just now. Please call 0800 098 2812 and we will take it down.';
/* ⛔ 503, NOT 502. Changed 3 Sep 2026.
   502 is Bad Gateway — a statement that the thing IN FRONT of this script had
   a bad answer from something behind it. That is not what happened: the script
   ran fine and cannot deliver, which is 503 Service Unavailable. It matters
   beyond pedantry because this site sits behind SiteGround's nginx, and a 502
   is precisely the status a fronting proxy is entitled to replace with its own
   error page — in which case the visitor loses the phone number in TC_FAIL and
   the form shows nothing useful at all. 503 is passed through. */
function tc_fail(): void { tc_out(503, ['ok' => false, 'errors' => [TC_FAIL]]); }

/**
 * GET /api/enquiry?selftest=1 — WHICH DELIVERY PATHS EXIST ON THIS SERVER.
 *
 * Added 3 Sep 2026 because we were guessing. The live host was failing every
 * enquiry in 1.3 seconds and there was no way, from outside, to tell whether
 * SMTP was unconfigured, cURL was missing, or the forward was being refused.
 * The legacy send.php has carried the same `?selftest=1` idea for years.
 *
 * ⛔ IT REVEALS NO SECRET. Booleans and a hostname only: never the password,
 * never the user, never the config array. `smtp` says whether a usable
 * password is present, not what it is.
 */
function tc_selftest(bool $smtpReady, string $forward): void {
  tc_out(200, [
    'ok'       => true,
    'endpoint' => 'enquiry',
    'delivery' => [
      'smtp'    => $smtpReady,
      'curl'    => function_exists('curl_init'),
      'forward' => $forward,
      'mail'    => function_exists('mail'),
    ],
    'php'      => PHP_VERSION,
  ]);
}

/* `?selftest=1` is the one GET this endpoint answers, and it is let through
   here rather than earlier because it reports the config, which is not read
   until below. Everything else that is not a POST is still refused. */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' && !isset($_GET['selftest'])) {
  tc_out(405, ['ok' => false, 'errors' => ['This endpoint takes a POST.']]);
}

/* --- configuration -------------------------------------------------------
   A missing or unfilled config is a DELIVERY failure, not a validation one:
   the visitor did nothing wrong, and telling them to phone is the honest
   answer. It is never a PHP warning — those would print above the JSON and
   break the response for the form's `r.json()`.                            */
$CFG = @include __DIR__ . '/config.php';
/* ⛔ A MISSING CONFIG IS NO LONGER THE END OF THE REQUEST. Changed 3 Sep 2026.
   It used to `tc_fail()` right here, which is why every enquiry on the live
   host died: config.php has never been created on that server, so the endpoint
   refused before it had even read the form. The Next route at
   src/app/api/enquiry/route.ts has ALWAYS had a second way out — SMTP first,
   the legacy send.php second, an honest failure third — and the two endpoints
   are meant to be the same contract on two hosts. This is that third path
   arriving on the PHP side; see the delivery block near the end of the file. */
$SMTP_READY = is_array($CFG)
  && !empty($CFG['pass'])
  && $CFG['pass'] !== 'PUT-THE-APP-PASSWORD-HERE';
if (!$SMTP_READY) {
  error_log('[topcat] api/enquiry: no usable config.php — will forward to the legacy endpoint');
  if (!is_array($CFG)) $CFG = [];
}
$SMTP_HOST = $CFG['host']      ?? 'smtp.gmail.com';
$SMTP_PORT = (int)($CFG['port'] ?? 465);
$SMTP_USER = $CFG['user']      ?? 'noreply@topcatworktops.co.uk';
$SMTP_PASS = $CFG['pass'] ?? '';
$TO        = $CFG['to']        ?? 'info@topcatworktops.co.uk';
$FROM      = $CFG['from']      ?? 'noreply@topcatworktops.co.uk';
$FROM_NAME = $CFG['from_name'] ?? 'Topcat Worktops';
/* Hoisted here from the delivery block so `?selftest=1` can report it without
   the request having to reach the bottom of the file. */
$FORWARD_URL = $CFG['forward'] ?? 'https://thadeusg3.sg-host.com/send.php';

/* Answered before the method check below, so it is reachable with a plain GET
   in a browser. Sends nothing and reveals no secret. */
if (isset($_GET['selftest'])) tc_selftest($SMTP_READY, $FORWARD_URL);

/* --- limits, matching route.ts and the client's own uploader -------------- */
$FILE_MAX  = 50 * 1024 * 1024;   // per file, route.ts FILE_MAX
$TOTAL_MAX = 100 * 1024 * 1024;  // all files together
$MIN_NAME  = 2;                  // route.ts MIN_NAME

/* --- the palette is the site's own (send.php:44-51) ---------------------- */
$INK = '#0B0B0E'; $BONE = '#F4F1EA'; $SEAM = '#E3DCCB'; $ROWLN = '#EFEAE0';
$GOLD = '#C6A664'; $TEXT = '#1B1B18'; $MUTE = '#8A857A'; $LINK = '#8A6D3B';

/* --- helpers, ported from send.php --------------------------------------- */
function h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function fld(string $k, int $max = 4000): string {
  $v = isset($_POST[$k]) && is_string($_POST[$k]) ? trim($_POST[$k]) : '';
  return mb_substr(str_replace(["\r", "\n"], ' ', $v), 0, $max);
}
function human_bytes(int $n): string {
  if ($n < 1024) return $n . ' B';
  if ($n < 1024 * 1024) return round($n / 1024) . ' KB';
  return round($n / 1048576, 1) . ' MB';
}
/** send.php:126 — which page family the form sat on, in the client's words. */
function page_label(string $p): string {
  if ($p === '/' || $p === '/index.html') return 'Home page';
  $exact = ['/contact/' => 'Contact page', '/trade/' => 'Trade page', '/about/' => 'About page',
            '/projects/' => 'Projects page', '/estimate/' => 'Estimate page'];
  foreach ($exact as $k => $v) if (strpos($p, $k) === 0) return $v;
  foreach (['/services/' => 'Service page', '/stones/' => 'Stone page',
            '/materials/' => 'Materials page', '/guides/' => 'Guide page',
            '/worktops/' => 'Area page'] as $k => $v) if (strpos($p, $k) === 0) return $v;
  return $p !== '' ? $p : 'the website';
}

/* --- the fields ---------------------------------------------------------- */
$name     = fld('name', 120);
$email    = fld('email', 200);
$phone    = fld('phone', 60);
$postcode = fld('postcode', 20);
$service  = fld('service', 120);
$stone    = fld('stone', 160);
$stoneLnk = fld('stone_link', 300);
$formName = fld('form_name', 40);
$page     = fld('page', 200);
$pageTtl  = fld('page_title', 90);
$device   = fld('device', 12);
$screen   = fld('screen', 16);
$message  = isset($_POST['message']) && is_string($_POST['message'])
          ? mb_substr(trim($_POST['message']), 0, 8000) : '';

/* --- the files ----------------------------------------------------------- */
$attach = [];
$fileErrors = [];
$totalBytes = 0;
foreach ($_FILES as $field => $f) {
  if (!is_array($f) || !isset($f['name'])) continue;
  /* Both shapes: file1, file2 … one each, and file[] arrays. */
  $names = is_array($f['name']) ? $f['name'] : [$f['name']];
  $tmps  = is_array($f['tmp_name']) ? $f['tmp_name'] : [$f['tmp_name']];
  $sizes = is_array($f['size']) ? $f['size'] : [$f['size']];
  $errs  = is_array($f['error']) ? $f['error'] : [$f['error']];
  foreach ($names as $i => $n) {
    $err = (int)($errs[$i] ?? UPLOAD_ERR_NO_FILE);
    if ($err === UPLOAD_ERR_NO_FILE || $n === '') continue;
    if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
      $fileErrors[] = ($n ?: 'A file') . ' is larger than the server accepts.';
      continue;
    }
    if ($err !== UPLOAD_ERR_OK) { $fileErrors[] = ($n ?: 'A file') . ' did not upload cleanly.'; continue; }
    $size = (int)($sizes[$i] ?? 0);
    if ($size > $FILE_MAX) { $fileErrors[] = ($n ?: 'A file') . ' is larger than 50 MB.'; continue; }
    $tmp = (string)($tmps[$i] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) continue;
    $totalBytes += $size;
    /* iOS photographs arrive with no extension at all (send.php, D439).
       Nothing here depends on the name, so it is carried as sent. */
    $attach[] = ['name' => basename((string)$n), 'tmp' => $tmp, 'size' => $size];
  }
}

/* --- validation, in route.ts's order and wording ------------------------- */
$errors = $fileErrors;
if (mb_strlen($name) < $MIN_NAME) {
  $errors[] = 'Please tell us your name.';
}
if ($email === '' && $phone === '') {
  $errors[] = 'Please leave an email address or a phone number so we can reply.';
}
/* Only when they actually gave one. A phone-only enquiry never reaches this —
   rejecting those was real lead loss once (commit 53ebd4c). */
$emailOK = ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) ? $email : '';
if ($email !== '' && $emailOK === '') {
  $errors[] = 'That email address does not look right.';
}
if ($totalBytes > $TOTAL_MAX) {
  $errors[] = 'Those files come to more than 100 MB in total.';
}
if ($errors) tc_out(422, ['ok' => false, 'errors' => array_values($errors)]);

/* --- the notification email ---------------------------------------------- */
function row(string $label, string $value): string {
  global $BONE, $SEAM, $ROWLN, $TEXT, $MUTE;
  return '<tr><td style="padding:13px 18px;background:' . $BONE . ';border-right:1px solid ' . $SEAM
    . ';border-bottom:1px solid ' . $ROWLN . ';color:' . $MUTE
    . ';font:600 10.5px/1.6 Arial,Helvetica,sans-serif;letter-spacing:0.1em;text-transform:uppercase;width:31%;vertical-align:top">'
    . h($label) . '</td><td style="padding:13px 18px;background:#FFFFFF;border-bottom:1px solid ' . $ROWLN
    . ';color:' . $TEXT . ';font:400 14.5px/1.6 Arial,Helvetica,sans-serif;vertical-align:top">' . $value . '</td></tr>';
}
function section(string $t): string {
  global $GOLD, $ROWLN;
  return '<tr><td colspan="2" style="padding:30px 18px 10px;background:#FFFFFF;border-bottom:1px solid '
    . $ROWLN . ';color:' . $GOLD
    . ';font:700 12px/1.4 Arial,Helvetica,sans-serif;letter-spacing:0.18em;text-transform:uppercase">'
    . h($t) . '</td></tr>';
}
function wide(string $html_): string {
  global $TEXT;
  return '<tr><td colspan="2" style="padding:14px 18px 18px;background:#FFFFFF;color:' . $TEXT
    . ';font:400 14.5px/1.7 Arial,Helvetica,sans-serif">' . $html_ . '</td></tr>';
}

$rows = row('Name', h($name));
if ($email)    $rows .= row('Email', '<a href="mailto:' . h($email) . '" style="color:' . $LINK . '">' . h($email) . '</a>');
if ($phone)    $rows .= row('Phone', '<a href="tel:' . h(preg_replace('/[^0-9+]/', '', $phone)) . '" style="color:' . $LINK . '">' . h($phone) . '</a>');
if ($postcode) $rows .= row('Postcode', h($postcode));
if ($service)  $rows .= row('Service', h($service));
if ($stone)    $rows .= row('Stone', h($stone));
if ($stoneLnk) $rows .= row('Stone link', '<a href="' . h($stoneLnk) . '" style="color:' . $LINK . '">' . h($stoneLnk) . '</a>');

/* ⛔ EVERY OTHER FIELD IS PRINTED TOO, exactly as send.php:286-291 did. A field
   added to a form therefore needs no change here — which is the whole reason
   the client's inbox has never silently dropped one. */
$known = ['name','email','phone','postcode','service','stone','stone_link','message','page',
          'page_title','form_name','device','screen','journey','estimate','sent_at'];
foreach ($_POST as $k => $v) {
  if (in_array($k, $known, true) || !is_string($v) || trim($v) === '') continue;
  $rows .= row(ucfirst(str_replace('_', ' ', mb_substr($k, 0, 40))), h(mb_substr(trim($v), 0, 500)));
}

if ($message !== '') { $rows .= section('Message'); $rows .= wide(nl2br(h($message))); }

/* The estimator's own state, when the visitor actually built one. */
$estimate = null;
if (isset($_POST['estimate']) && is_string($_POST['estimate']) && $_POST['estimate'] !== '') {
  $estimate = json_decode($_POST['estimate'], true);
}
if (is_array($estimate) && !empty($estimate['stone'])) {
  $rows .= section('Their estimate');
  foreach (['mat' => 'Material', 'stone' => 'Stone', 'pieces' => 'Pieces', 'slabs' => 'Slabs',
            'extras' => 'Extras', 'range' => 'Range', 'area' => 'Area'] as $k => $label) {
    if (isset($estimate[$k]) && $estimate[$k] !== '' && !is_array($estimate[$k])) {
      $rows .= row($label, h((string)$estimate[$k]));
    }
  }
}

if ($attach) {
  $rows .= section(count($attach) === 1 ? 'Their file' : 'Their files');
  $list = [];
  foreach ($attach as $f) $list[] = h($f['name']) . ' <span style="color:' . $MUTE . '">' . human_bytes($f['size']) . '</span>';
  $rows .= wide(implode('<br>', $list));
}

/* Where they were, and on what. */
$whereLine = page_label($page) . ($pageTtl ? ' — ' . $pageTtl : '');
$rows .= section('Where they sent it from');
$rows .= row('Page', h($whereLine));
if ($page)     $rows .= row('Path', h($page));
if ($formName) $rows .= row('Form', h($formName));
if ($device)   $rows .= row('Device', h($device) . ($screen ? ' (' . h($screen) . ')' : ''));

/* The visit trail, as sent. Rendered compactly rather than reproducing
   compose.ts's full summary: everything is present, nothing is invented. */
$journey = null;
if (isset($_POST['journey']) && is_string($_POST['journey']) && $_POST['journey'] !== '') {
  $journey = json_decode($_POST['journey'], true);
}
if (is_array($journey) && !empty($journey['ev']) && is_array($journey['ev'])) {
  $ev = array_slice($journey['ev'], -60);
  $lines = [];
  foreach ($ev as $e) {
    if (!is_array($e)) continue;
    $when = isset($e['at']) ? date('H:i', (int)((int)$e['at'] / 1000)) : '';
    $what = trim(($e['k'] ?? '') . ' ' . ($e['v'] ?? $e['p'] ?? $e['s'] ?? ''));
    if ($what === '') continue;
    $lines[] = '<span style="color:' . $MUTE . '">' . h($when) . '</span>&nbsp;&nbsp;' . h($what);
  }
  if ($lines) { $rows .= section('What they did'); $rows .= wide(implode('<br>', $lines)); }
}

$html = '<!doctype html><html><body style="margin:0;padding:24px 0;background:' . $INK . '">'
  . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:' . $INK . '"><tr><td align="center">'
  . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:640px;max-width:96%;background:#FFFFFF;border-radius:4px;overflow:hidden">'
  . '<tr><td colspan="2" style="padding:20px 18px;background:' . $INK . '">'
  . '<img src="https://www.topcatworktops.co.uk/assets/brand/topcat-email.png" alt="Topcat Worktops" width="220" height="59" style="display:block;border:0;outline:none;text-decoration:none;width:220px;height:59px">'
  . '</td></tr>'
  . $rows . '</table></td></tr></table></body></html>';

$plain = "NEW ENQUIRY\n\n" . $whereLine . ($device ? " · $device" : '') . "\n\n"
  . "Name: $name\n" . ($email ? "Email: $email\n" : '') . ($phone ? "Phone: $phone\n" : '')
  . ($postcode ? "Postcode: $postcode\n" : '') . ($service ? "Service: $service\n" : '')
  . ($stone ? "Stone: $stone\n" : '')
  . ($message !== '' ? "\nMESSAGE\n$message\n" : '');
foreach ($attach as $f) $plain .= "\nFile: " . $f['name'] . ' (' . human_bytes($f['size']) . ')';

$subject = 'New enquiry — ' . $name . ($postcode ? ' (' . $postcode . ')' : '')
         . ' · ' . page_label($page) . ($device ? ' · ' . $device : '');

/* --- the autoreply — composeAutoReply() from src/lib/mail/compose.ts ------ */
$first = trim(explode(' ', trim($name))[0] ?? '');
$detail = [];
if ($name)     $detail[] = ['Name', $name];
if ($email)    $detail[] = ['Email', $email];
if ($phone)    $detail[] = ['Phone', $phone];
if ($postcode) $detail[] = ['Postcode', $postcode];
if ($service)  $detail[] = ['What you need', $service];
if ($stone)    $detail[] = ['Stone', $stone];
if ($message !== '') $detail[] = ['Your message', $message];
if ($attach) {
  $ns = array_map(static fn($f) => $f['name'], $attach);
  $detail[] = [count($attach) === 1 ? 'File attached' : 'Files attached', implode(', ', $ns)];
}
$arRows = '';
foreach ($detail as [$k, $v]) {
  $arRows .= '<tr><td style="padding:11px 18px;background:' . $BONE . ';border-right:1px solid ' . $SEAM
    . ';border-bottom:1px solid ' . $ROWLN . ';color:' . $MUTE
    . ';font:600 10.5px/1.6 Arial,Helvetica,sans-serif;letter-spacing:0.1em;text-transform:uppercase;width:34%;vertical-align:top">'
    . h($k) . '</td><td style="padding:11px 18px;background:#FFFFFF;border-bottom:1px solid ' . $ROWLN
    . ';color:' . $TEXT . ';font:400 14.5px/1.6 Arial,Helvetica,sans-serif;vertical-align:top">'
    . nl2br(h($v)) . '</td></tr>';
}
$arSubject = 'Thank you for contacting Topcat Worktops';
$arHtml = '<!doctype html><html><body style="margin:0;padding:24px 0;background:' . $INK . '">'
  . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:' . $INK . '"><tr><td align="center">'
  . '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:96%;background:#FFFFFF;border-radius:4px;overflow:hidden">'
  /* ⛔ THE WORDMARK IS AN IMAGE, NOT LETTER-SPACED TEXT. The client: "the top
     bar where it says Topcat Worktops in just letters, can we not just have the
     actual Topcat logo be at the top there." PNG, not the site's SVG, because
     Outlook and Gmail will not render SVG; drawn at 2x and declared at 220x59
     so it is sharp on a retina screen. `alt` carries the name for the many
     clients that block images, and the cell keeps the ink background so a
     blocked image still reads as the brand's header rather than a white gap. */
  . '<tr><td style="padding:20px 18px;background:' . $INK . '">'
  . '<img src="https://www.topcatworktops.co.uk/assets/brand/topcat-email.png" alt="Topcat Worktops" width="220" height="59" style="display:block;border:0;outline:none;text-decoration:none;width:220px;height:59px">'
  . '</td></tr>'
  . '<tr><td style="padding:26px 18px 6px;background:#FFFFFF;color:' . $TEXT . ';font:400 15px/1.7 Arial,Helvetica,sans-serif">'
  . ($first !== '' ? '<p style="margin:0 0 14px">Hi ' . h($first) . ',</p>' : '')
  . '<p style="margin:0 0 14px">Thank you for contacting Topcat Worktops. We have received your enquiry and someone from our team will get back to you shortly, always within one working day.</p>'
  . '<p style="margin:0 0 4px">These are the details you sent us.</p></td></tr>'
  . ($arRows ? '<tr><td style="padding:14px 0 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">' . $arRows . '</table></td></tr>' : '')
  . '<tr><td style="padding:22px 18px 26px;background:#FFFFFF;color:' . $TEXT . ';font:400 15px/1.7 Arial,Helvetica,sans-serif">'
  /* ⛔ IT USED TO SAY "REPLY TO THIS EMAIL", AND IT COMES FROM noreply@. The
     client: "this is coming from a no-reply email, so that doesn't make any
     sense." A Reply-To IS set on this message, so a reply would in fact reach
     info@ — but the address the customer SEES is noreply@, and telling someone
     to reply to an address that announces it does not read replies is asking
     them to distrust the instruction. So it names the routes explicitly. */
  . '<p style="margin:0 0 14px">If anything above is not correct, please email '
  . '<a href="mailto:info@topcatworktops.co.uk" style="color:' . $LINK . '">info@topcatworktops.co.uk</a>'
  . ' or send us a WhatsApp on <a href="https://wa.me/447464940287" style="color:' . $LINK . '">07464 940287</a>.'
  . ' If it is urgent, call us free on <a href="tel:+448000982812" style="color:' . $LINK . '">0800 098 2812</a>.</p>'
  . '<p style="margin:0">Thank you again,<br>Topcat Worktops</p></td></tr>'
  . '<tr><td style="padding:16px 18px;background:' . $BONE . ';color:' . $MUTE . ';font:400 11.5px/1.7 Arial,Helvetica,sans-serif">'
  . '0800 098 2812 &nbsp;&middot;&nbsp; <a href="mailto:info@topcatworktops.co.uk" style="color:' . $LINK . '">info@topcatworktops.co.uk</a><br>'
  . 'This is an automatic confirmation. You do not need to do anything else.</td></tr>'
  . '</table></td></tr></table></body></html>';

$arText = ($first !== '' ? "Hi $first,\n\n" : '')
  . "Thank you for contacting Topcat Worktops. We have received your enquiry and someone from our team will get back to you shortly, always within one working day.\n\n";
if ($detail) {
  $arText .= "These are the details you sent us.\n\n";
  foreach ($detail as [$k, $v]) $arText .= "$k: $v\n";
  $arText .= "\n";
}
$arText .= "If anything above is not correct, please email info@topcatworktops.co.uk or send us a WhatsApp on 07464 940287. If it is urgent, call us free on 0800 098 2812.\n\n"
  . "Thank you again,\nTopcat Worktops\n0800 098 2812\ninfo@topcatworktops.co.uk";

/* --- delivery ------------------------------------------------------------ */
require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

function tc_mailer(string $host, int $port, string $user, string $pass): PHPMailer {
  $m = new PHPMailer(true);
  $m->isSMTP();
  $m->Host       = $host;
  $m->SMTPAuth   = true;
  $m->Username   = $user;
  $m->Password   = $pass;
  /* 465 is implicit TLS (SMTPS); 587 is STARTTLS. Choosing on the port rather
     than hard-coding one means a move to 587 needs only a config edit. */
  $m->SMTPSecure = $port === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
  $m->Port       = $port;
  $m->CharSet    = 'UTF-8';
  $m->Timeout    = 20;
  return $m;
}

/* ⛔ THE NOTIFICATION IS THE ONE THAT DECIDES THE RESPONSE. If it fails the
   visitor is told to phone; the autoreply is a courtesy and its failure must
   never turn a delivered enquiry into an error. */
/**
 * The legacy endpoint on the client's OWN old host, which is configured and
 * sending today — `GET send.php?selftest=1` answers
 * {"ok":true,"via":"branded+host-envelope","to":"info@topcatworktops.co.uk"}.
 * Identical default to route.ts's ENQUIRY_FORWARD_URL, so both endpoints fall
 * back to the same place. Overridable from config.php without touching code.
 */
/**
 * Hand the ORIGINAL submission to the legacy endpoint, exactly as the browser
 * sent it: same field names, same files. send.php then builds and sends both
 * emails itself, which is why nothing composed above is passed along — this is
 * a handover, not a re-send, and it is the same thing route.ts does.
 */
function tc_forward(string $url): bool {
  if ($url === '' || !function_exists('curl_init')) return false;
  $post = [];
  foreach ($_POST as $k => $v) { if (is_string($v)) $post[$k] = $v; }
  foreach ($_FILES as $field => $f) {
    $names = is_array($f['name']) ? $f['name'] : [$f['name']];
    $tmps  = is_array($f['tmp_name']) ? $f['tmp_name'] : [$f['tmp_name']];
    $types = is_array($f['type']) ? $f['type'] : [$f['type']];
    foreach ($names as $i => $n) {
      if (!isset($tmps[$i]) || !is_uploaded_file($tmps[$i])) continue;
      $key = is_array($f['name']) ? $field . '[' . $i . ']' : $field;
      $post[$key] = new CURLFile($tmps[$i], $types[$i] ?: 'application/octet-stream', $n ?: 'attachment');
    }
  }
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $post,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    /* Bounded, because a visitor is waiting on this request. Long enough for
       an upload of real photographs on a domestic connection. */
    CURLOPT_TIMEOUT => 25,
    CURLOPT_CONNECTTIMEOUT => 8,
  ]);
  $body = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err  = curl_error($ch);
  /* NO curl_close(). It is deprecated from PHP 8.5 and the notice PRINTS,
     above the JSON, which is precisely the failure this file's header warns
     about: the form calls r.json() on the response, and a stray <br /><b>
     ahead of the body makes it unparseable. Caught on PHP 8.5 locally before
     this shipped. The handle is freed when it goes out of scope, and has been
     since PHP 8.0. */
  if ($body === false || $code < 200 || $code >= 300) {
    error_log('[topcat] api/enquiry forward failed: HTTP ' . $code . ' ' . $err);
    return false;
  }
  /* send.php answers {"ok":true,...}. Anything else is a refusal, and a 200
     carrying ok:false must not be read as delivered. */
  $j = json_decode((string)$body, true);
  if (is_array($j) && array_key_exists('ok', $j)) return $j['ok'] === true;
  error_log('[topcat] api/enquiry forward: unreadable answer: ' . substr((string)$body, 0, 200));
  return false;
}

/**
 * The host's own mail transport. PHPMailer's `isMail()` hands the message to
 * PHP's mail(), which on this host is the local MTA — so it needs NO password
 * and NO outbound HTTP, which is exactly what the other two paths need and
 * what this server appears not to give them.
 *
 * ⚠️ The envelope stays on the site's own domain (`$FROM` is
 * noreply@topcatworktops.co.uk) because info@ is hosted here too: a message
 * from a domain the sending host is authoritative for is the case SPF is
 * happiest with. Do not "fix" a delivery problem by putting the visitor's
 * address in From; that is the spoof that gets a domain blocked.
 */
function tc_send_by_mail(array $m): bool {
  try {
    $x = new PHPMailer(true);
    $x->isMail();
    $x->CharSet = 'UTF-8';
    $x->setFrom($m['from'], $m['fromName']);
    $x->addAddress($m['to']);
    if ($m['replyTo'] !== '') $x->addReplyTo($m['replyTo'], $m['replyName']);
    foreach ($m['attach'] as $f) $x->addAttachment($f['tmp'], $f['name']);
    $x->isHTML(true);
    $x->Subject = $m['subject'];
    $x->Body    = $m['html'];
    $x->AltBody = $m['plain'];
    $x->send();
    return true;
  } catch (MailException|Throwable $e) {
    error_log('[topcat] api/enquiry mail() failed: ' . $e->getMessage());
    return false;
  }
}

$delivered = false;
/* Which rung carried it, reported in the JSON so the next person can see the
   delivery path without adding logging. send.php does the same with X-TC-Sender. */
$VIA = 'none';

if ($SMTP_READY) {
  try {
    $m = tc_mailer($SMTP_HOST, $SMTP_PORT, $SMTP_USER, $SMTP_PASS);
    $m->setFrom($FROM, $FROM_NAME);
    $m->addAddress($TO);
    /* So the client can hit reply and reach the customer, not the noreply box. */
    if ($emailOK !== '') $m->addReplyTo($emailOK, $name !== '' ? $name : $emailOK);
    foreach ($attach as $f) $m->addAttachment($f['tmp'], $f['name']);
    $m->isHTML(true);
    $m->Subject = $subject;
    $m->Body    = $html;
    $m->AltBody = $plain;
    $m->send();
    $delivered = true;
    $VIA = 'smtp';
  } catch (MailException|Throwable $e) {
    error_log('[topcat] api/enquiry notification failed: ' . $e->getMessage());
  }
}

/* ⛔ NOT `else`. If SMTP is configured but fails on THIS request, the enquiry
   is still worth more than the error — route.ts carries the same comment and
   the same decision. */

/*
  ⛔ THE HOST'S OWN mail() COMES BEFORE THE FORWARD, AND THE ORDER IS THE WHOLE
  POINT. REORDERED 3 Sep 2026 after enquiries reported "sent" and never arrived.

  The forward answers {"ok":true} when the FAR host's mail() QUEUES the message.
  Queued is not delivered, and on that path it was not being delivered:

    topcatworktops.co.uk  A          35.214.97.99    site and mailbox
    thadeusg3.sg-host.com A          35.214.107.17   the forwarding host
    SPF  v=spf1 +a +mx include:_spf.mailspamprotection.com ~all
    MX   mx10/20/30.antispam.mailspamprotection.com

  35.214.107.17 is not covered by +a, not by +mx, and not by the include, so it
  falls through to ~all. The message therefore arrives claiming to be From an
  address at topcatworktops.co.uk, from a server that domain does not authorise,
  addressed to that same domain, at SiteGround's own antispam MX. That is the
  exact shape of a spoof and it is quarantined. mail() returned true, send.php
  answered ok, this endpoint reported delivered, and nobody received anything.

  This host is 35.214.97.99 — the SAME machine that holds the mailbox. Its
  mail() is a local handover that never crosses a network boundary and passes
  SPF on `+a`. It is strictly the better path wherever it exists, so it is tried
  first and the forward is kept only as the last resort for a host that has no
  working mail() of its own.

  ⚠️ DO NOT "SIMPLIFY" THIS BACK. A forward that reports success while the mail
  is being dropped is worse than an honest failure, because it hides the fault
  behind a thank-you message.
*/
if (!$delivered) {
  $delivered = tc_send_by_mail([
    'from' => $FROM, 'fromName' => $FROM_NAME, 'to' => $TO,
    'replyTo' => $emailOK, 'replyName' => $name !== '' ? $name : $emailOK,
    'attach' => $attach, 'subject' => $subject, 'html' => $html, 'plain' => $plain,
  ]);
  if ($delivered) $VIA = 'mail';
}

if (!$delivered) {
  $delivered = tc_forward($FORWARD_URL);
  if ($delivered) $VIA = 'forward';
}

if (!$delivered) tc_fail();

/* Only when we sent the notification ourselves. On the forwarded path send.php
   has already sent its own confirmation, and a second one would be a duplicate
   in the customer's inbox. */
if ($SMTP_READY && $emailOK !== '') {
  try {
    $a = tc_mailer($SMTP_HOST, $SMTP_PORT, $SMTP_USER, $SMTP_PASS);
    $a->setFrom($FROM, $FROM_NAME);
    $a->addAddress($emailOK, $name !== '' ? $name : $emailOK);
    /* A reply to the confirmation must reach a human, not the noreply box. */
    $a->addReplyTo($TO, 'Topcat Worktops');
    $a->isHTML(true);
    $a->Subject = $arSubject;
    $a->Body    = $arHtml;
    $a->AltBody = $arText;
    $a->send();
  } catch (MailException|Throwable $e) {
    /* Swallowed on purpose — see above. The enquiry IS delivered. */
    error_log('[topcat] api/enquiry autoreply failed: ' . $e->getMessage());
  }
}

tc_out(200, ['ok' => true, 'via' => $VIA]);
