import type { ElementType } from 'react';

/**
 * Renders one extracted inline-HTML run.
 *
 * The legacy copy is full of two inline elements that carry meaning:
 * `<em>`, which service.css paints gold (`em{font-style:normal;color:var(--gold-soft)}`)
 * and which is the site's whole heading rhythm — "About <em>granite</em>",
 * "Make it <em>yours</em>" — and `<a>`, which appears mid-sentence inside
 * `.sub` and `.st-source` paragraphs.
 *
 * The extractor keeps both in an `html` field beside the flattened `text`.
 * Rebuilding the markup from `text` + `accent` would go wrong the moment the
 * accent word appears twice in a sentence, so the `html` is emitted directly.
 *
 * The input is our own build-time extraction of files in this repository, not
 * user input or anything fetched at runtime; there is no injection surface.
 */
export interface RichValue {
  text: string;
  html?: string;
}

export function Rich({
  as,
  value,
  className,
}: {
  as: ElementType;
  value: RichValue;
  className?: string;
}) {
  const Tag = as;
  const html = value.html ?? '';

  // No inline markup: render as a text child so the DOM stays minimal and the
  // component is trivially assertable in tests.
  if (!html || html === value.text) {
    return <Tag className={className}>{value.text}</Tag>;
  }

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
