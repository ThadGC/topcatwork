'use client';

/**
 * The /articles grid, and the "Load more" control.
 *
 * ---------------------------------------------------------------------------
 * EVERY ARTICLE IS IN THE HTML. ONLY SIX ARE VISIBLE.
 * ---------------------------------------------------------------------------
 * The cards beyond the current page are rendered and then hidden with the
 * `hidden` attribute, rather than sliced out of the array. That is a
 * deliberate SEO choice: `/articles` is prerendered, so whatever this
 * component returns on the server IS the static file a crawler downloads.
 * Slicing would publish a page that links six articles and silently orphans
 * the rest — they would be reachable only by a visitor who pressed a button,
 * which is exactly the shape of internal linking that leaves pages
 * un-indexed. Hidden-but-present keeps every article one crawlable <a> from
 * the hub while the visitor still sees six.
 *
 * ---------------------------------------------------------------------------
 * THE RUNTIME TOP-UP
 * ---------------------------------------------------------------------------
 * `articles` is the build-time list — what `readArticles()` found in
 * `public/articles/` when `next build` ran. On the live SiteGround host,
 * articles are uploaded by hand AFTER that build, so the baked list goes
 * stale the moment one is added.
 *
 * The effect below asks `/api/articles` for the folder as it stands right
 * now and merges anything the build did not know about. It is PURE
 * ENHANCEMENT and is written so that every failure mode is a no-op: no
 * endpoint, a 404, an HTML error page, malformed JSON, a slug already known
 * — all of them leave the prerendered list exactly as it was. Nothing here
 * can make the page worse than the static HTML it started as.
 *
 * ⚠️ It runs in an effect, never during render, so the server and the first
 * client render agree and there is no hydration mismatch.
 */
import { useEffect, useState } from 'react';

export interface ArticleCard {
  slug: string;
  url: string;
  title: string;
  description: string;
  published: string;
}

interface ArticleListProps {
  /** Newest first, from the build. */
  readonly articles: readonly ArticleCard[];
  /** How many more each press reveals. */
  readonly step: number;
}

/** Newest first, ties broken on slug — the same total order as the build. */
function byNewest(a: ArticleCard, b: ArticleCard): number {
  return a.published === b.published
    ? a.slug.localeCompare(b.slug)
    : b.published.localeCompare(a.published);
}

/**
 * Accept a record only if it is the shape we serve. The endpoint is our own,
 * but it reads a folder a human writes into, so a half-finished file is a
 * realistic input and must not be able to throw during render.
 */
function isCard(value: unknown): value is ArticleCard {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.slug === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug) &&
    typeof c.url === 'string' &&
    c.url === `/articles/${c.slug}` &&
    typeof c.title === 'string' &&
    c.title.length > 0 &&
    typeof c.description === 'string' &&
    typeof c.published === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(c.published)
  );
}

export function ArticleList({ articles, step }: ArticleListProps) {
  const [live, setLive] = useState<readonly ArticleCard[]>(articles);
  const [visible, setVisible] = useState(step);

  useEffect(() => {
    /* Aborted on unmount so a slow host cannot set state on a dead tree. */
    const abort = new AbortController();

    (async () => {
      try {
        const response = await fetch('/api/articles', {
          signal: abort.signal,
          headers: { accept: 'application/json' },
        });
        if (!response.ok) return;
        if (!response.headers.get('content-type')?.includes('json')) return;

        const payload: unknown = await response.json();
        const found = (payload as { articles?: unknown })?.articles;
        if (!Array.isArray(found)) return;

        const known = new Set(articles.map((a) => a.slug));
        const extra = found.filter(isCard).filter((a) => !known.has(a.slug));
        if (extra.length === 0) return;

        setLive([...articles, ...extra].sort(byNewest));
      } catch {
        /* Offline, aborted, CORS, a PHP notice printed before the JSON — the
           prerendered list stands. This is the designed outcome, not a gap. */
      }
    })();

    return () => abort.abort();
  }, [articles]);

  if (live.length === 0) {
    return (
      <p className="art-empty">
        There is nothing here yet. New pieces on choosing, living with and
        caring for stone worktops will appear on this page as they are written.
      </p>
    );
  }

  const shown = Math.min(visible, live.length);

  return (
    <>
      <div className="mgrid">
        {live.map((article, index) => (
          <a
            className="mcard"
            key={article.slug}
            href={article.url}
            hidden={index >= shown}
          >
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <span className="mcard-go">Read the article</span>
          </a>
        ))}
      </div>

      {shown < live.length && (
        <div className="art-more">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setVisible((v) => v + step)}
          >
            Load more
          </button>
          <p className="art-count" aria-live="polite">
            Showing {shown} of {live.length}
          </p>
        </div>
      )}
    </>
  );
}
