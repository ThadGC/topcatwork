# TopCat Worktops — the new site

This branch holds **only the new site**. Everything else that lives on
`erik/react-rewrite` (the old vanilla build at the repo root, and the
`tools/compare-harness` test rig) has been stripped out.

Everything you need is in **`topcat-site/`**.

---

## What this is

A **Next.js 16 application**, not a folder of HTML files.

That matters for how it goes live, so please read the next section before
handing it to anyone. It is not a drag-and-drop upload.

## How it goes live

**It needs a Node host. Vercel is what it is built for.**

```bash
cd topcat-site
npm install          # or: npx pnpm@10 install
npm run build
npm start            # serves on :3000
```

On Vercel: point a project at this repo, set the root directory to
`topcat-site`, and deploy. No other configuration is needed.

**You cannot FTP this onto the SiteGround box as-is.** Two things stop it:

1. **`/api/enquiry`** is a server route. It composes the enquiry email, sends it
   over SMTP when configured, and falls back to the legacy `send.php` when not.
   It is the only server-rendered route in the whole build; every other page is
   prerendered to static HTML.
2. **URL rewrites.** The 157 legacy `.html` URLs (`/stones/<slug>.html` and so
   on) are served by rewrites in `next.config.ts`, not by files on disk.

### If it does have to be a plain file upload

A static export IS possible, and it was tested: everything compiles, and the
`.html` URLs come back for free because the exporter writes them as real files.
It costs you the enquiry route, which means:

- the form has to post to the legacy `send.php` again, as the old site did, and
- the **customer confirmation email is lost**, because that is composed by the
  route handler. `send.php` has its own autoreply written but switched off.

That is a product decision, not a build setting, which is why it has not been
done here. Say the word and it is a short piece of work.

## Before it goes live

- **SMTP is not configured.** Enquiries still arrive, via the `send.php`
  fallback, but the customer confirmation cannot send at all without it, and
  delivery depends on the old host staying alive. `topcat-site/.env.example`
  lists every variable that needs setting.
- **Set the domain** in `topcat-site/src/lib/site.ts`. Every canonical tag and
  the sitemap currently say `https://www.topcatworktops.co.uk`.
- There is **no cache-header config** yet (no `vercel.json`, no `headers()` in
  `next.config.ts`). The old `.htaccess` rules have no equivalent. This matters
  most for the hero film.
