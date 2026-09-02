<?php
/**
 * GET /api/articles — the articles folder as it stands right now.
 *
 * THE APACHE HALF OF A PAIR. `src/app/api/articles/route.ts` is the other
 * half and answers the same URL on Vercel, with the same JSON contract, so
 * the listing page cannot tell which one replied. Exactly the arrangement
 * `api/enquiry/index.php` already uses beside `app/api/enquiry/route.ts`, and
 * for the same reason: topcatworktops.co.uk is a STATIC SNAPSHOT served by
 * Apache, which cannot run a Next route handler.
 *
 * ---------------------------------------------------------------------------
 * THIS FILE IS WHAT MAKES "DROP IT IN AND IT APPEARS" TRUE
 * ---------------------------------------------------------------------------
 * /articles is prerendered. The list inside it is whatever was on disk when
 * the build ran, and on this host articles are uploaded by hand long after
 * that. Without this endpoint a new article is live at its own URL and
 * invisible on the hub until someone rebuilds and re-uploads the whole site.
 * With it, the hub tops itself up on the next page view.
 *
 * ---------------------------------------------------------------------------
 * IT MUST NEVER BE ABLE TO BREAK THE PAGE
 * ---------------------------------------------------------------------------
 * The caller treats any failure as "no extra articles" and keeps its
 * prerendered list, so the worst outcome here is a stale hub, never a broken
 * one. That is why every parse below is defensive and a bad file is skipped
 * rather than fatal: one half-uploaded article must not empty the response.
 *
 * ⚠️ IT IS READ-ONLY AND TAKES NO INPUT. No query string, no body, nothing
 * from the request reaches the filesystem — the directory it lists is a
 * constant. There is no injection surface to guard.
 *
 * ⚠️ ONE REDIRECT HOP, AND IT IS DELIBERATELY LEFT ALONE. Apache's mod_dir
 * 301s /api/articles to /api/articles/ before DirectoryIndex serves this
 * file. Measured on Apache 2.4.67 against this repo's own .htaccess. For a
 * GET that is harmless: fetch() follows it, and this is a background
 * enhancement, not a page load.
 *
 * Two fixes were tried and both were rejected. A scoped `DirectorySlash Off`
 * beside this file turns the 301 into a 404, because mod_dir will not serve
 * a DirectoryIndex for the slash-less form; the /articles hub only survives
 * that treatment because public/.htaccess carries an explicit rewrite for it.
 * And an explicit rewrite here would have to sit ABOVE rule 0 in
 * public/.htaccess, which is the guard protecting the enquiry endpoint that
 * every form on the site posts to. A free hop is not worth editing that.
 *
 * ⛔ THE ENQUIRY ENDPOINT NEXT DOOR HAS THE SAME SHAPE, AND THERE THE HOP IS
 * NOT HARMLESS: /api/enquiry is POSTed to, and a browser re-issues a 301 as
 * a GET, which index.php answers 405. That is pre-existing, predates this
 * work and is not changed here, but it is a real fault and it is written up
 * in the handover.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
/* The listing merges this on every visit; a cached copy defeats the point. */
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

/* Only GET. Anything else is a mistake worth naming rather than answering. */
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'HEAD') {
    http_response_code(405);
    header('Allow: GET, HEAD');
    echo json_encode(['articles' => [], 'error' => 'method not allowed']);
    exit;
}

/** The articles live one directory up from /api/. */
$dir = dirname(__DIR__, 2) . '/articles';

/**
 * Pull one meta tag's content, whichever order the attributes are written in.
 *
 * ⛔ THE BACKREFERENCE IS LOAD-BEARING. Matching the value as [^"']* ends it
 * at the first APOSTROPHE rather than at the quote that opened it, so
 * content="a fitter's checklist" comes back as "a fitter". Caught on the live
 * listing, where a card had quietly lost half its headline. `\2` closes on
 * whichever quote opened. src/lib/articles.ts carries the identical fix, and
 * the two must stay identical or the runtime list and the built list disagree.
 */
function meta_content(string $html, string $name): ?string
{
    $n = preg_quote($name, '/');
    if (preg_match('/<meta[^>]*\sname=["\']' . $n . '["\'][^>]*\scontent=(["\'])(.*?)\1/i', $html, $m)) {
        return $m[2];
    }
    if (preg_match('/<meta[^>]*\scontent=(["\'])(.*?)\1[^>]*\sname=["\']' . $n . '["\']/i', $html, $m)) {
        return $m[2];
    }
    return null;
}

/** The five entities the template's own prose can legitimately contain. */
function decode_entities(string $value): string
{
    return strtr($value, [
        '&amp;' => '&',
        '&lt;' => '<',
        '&gt;' => '>',
        '&quot;' => '"',
        '&#39;' => "'",
        '&apos;' => "'",
    ]);
}

const TITLE_SUFFIX = ' | Topcat Worktops';

$articles = [];

/* GLOB_NOSORT because the sort below is the one that matters, and because the
   filesystem's order is not a promise on any host. */
foreach ((glob($dir . '/*.html', GLOB_NOSORT) ?: []) as $path) {
    $file = basename($path);

    /* `_TEMPLATE.html` and any dotfile are scaffolding, not content — the
       same rule src/lib/articles.ts applies. */
    if ($file === '' || $file[0] === '_' || $file[0] === '.') {
        continue;
    }

    $slug = substr($file, 0, -5);
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
        continue;
    }

    $html = @file_get_contents($path);
    if ($html === false) {
        continue;
    }

    if (!preg_match('/<title>([\s\S]*?)<\/title>/i', $html, $m)) {
        continue;
    }
    $documentTitle = trim(preg_replace('/\s+/', ' ', decode_entities($m[1])) ?? '');

    $description = meta_content($html, 'description');
    $published = meta_content($html, 'article:published');

    if ($documentTitle === '' || $description === null || $published === null) {
        continue;
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $published)) {
        continue;
    }

    /* An explicit card headline wins; otherwise the <title> minus the site
       suffix, which is what the cards on the rest of the site show. */
    $explicit = meta_content($html, 'article:title');
    if ($explicit !== null && $explicit !== '') {
        $title = decode_entities($explicit);
    } elseif (str_ends_with($documentTitle, TITLE_SUFFIX)) {
        $title = trim(substr($documentTitle, 0, -strlen(TITLE_SUFFIX)));
    } else {
        $title = $documentTitle;
    }

    $articles[] = [
        'slug' => $slug,
        'url' => '/articles/' . $slug,
        'title' => $title,
        'description' => trim(decode_entities($description)),
        'published' => $published,
    ];
}

/* Newest first, ties broken on slug ascending — the same total order
   src/lib/articles.ts produces, so a merged list cannot reshuffle. */
usort($articles, static function (array $a, array $b): int {
    return $a['published'] === $b['published']
        ? strcmp($a['slug'], $b['slug'])
        : strcmp($b['published'], $a['published']);
});

echo json_encode(
    ['articles' => $articles],
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);
