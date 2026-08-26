/**
 * The article body of a guide page — everything between `<main>` and the
 * closing CTA band, in the source's own shape.
 *
 * ---------------------------------------------------------------------------
 * THE SHAPE, AND WHY IT IS COMPUTED RATHER THAN HARD-CODED
 * ---------------------------------------------------------------------------
 * A legacy guide is:
 *
 *   <article>
 *     <section class="block">        h1, byline, .prose.lead-answer
 *     <div class="lead-grid">
 *       <div class="lead-main">      the body sections, 4 to 8 of them
 *       <aside class="lead-aside">   form.qform
 *     </div>
 *     <section class="faq">          the <details> accordion
 *     <section class="block">        Related
 *   </article>
 *   <section class="cta-band">       outside the article
 *
 * The tempting version of this is `blocks[0]`, `blocks.slice(1, -3)`,
 * `blocks.at(-3)`… and it is wrong on the data: the body runs 4 to 8 sections,
 * the comparison table is the first body section on five guides, the second on
 * two, and absent on two. Every block instead carries `region`, which IS the
 * two-column split, so the grouping below is a fold over that field. Add a
 * tenth guide with a different section count and it lands correctly with no
 * change here.
 *
 * ---------------------------------------------------------------------------
 * THE CTA BAND IS OUTSIDE <article>
 * ---------------------------------------------------------------------------
 * In the source it is a sibling of `</article>`, not the last child, and that
 * is right: the band is site furniture, not part of the piece of writing the
 * `Article` JSON-LD describes. It stays outside here for the same reason.
 */
import QuickForm from '@/components/forms/QuickForm';
import type { GuideBlock } from '@/lib/guides';

import { GuideSection, GuideSections } from './GuideBlocks';

/**
 * Fold the block list into runs of one region, preserving order.
 *
 * Returns `[{ region, blocks }, …]`, e.g. main(1) -> lead-main(6) -> main(2).
 */
function groupByRegion(blocks: GuideBlock[]) {
  const runs: { region: GuideBlock['region']; blocks: GuideBlock[] }[] = [];
  for (const block of blocks) {
    const last = runs[runs.length - 1];
    if (last && last.region === block.region) last.blocks.push(block);
    else runs.push({ region: block.region, blocks: [block] });
  }
  return runs;
}

export function GuideArticle({ blocks }: { blocks: GuideBlock[] }) {
  /*
    The CTA band is identified by kind, not by position. It is the last block
    on all nine guides today, but "last" is a fact about the current data and
    "is the CTA band" is the thing that decides which side of `</article>` it
    belongs on.
  */
  const article = blocks.filter((b) => b.kind !== 'ctaBand');
  const bands = blocks.filter((b) => b.kind === 'ctaBand');

  return (
    <>
      <article>
        {groupByRegion(article).map((run, i) =>
          run.region === 'lead-main' ? (
            <div className="lead-grid" key={i}>
              <div className="lead-main">
                <GuideSections blocks={run.blocks} />
              </div>
              {/*
                `.lead-aside` is `display:none` until 1100px in service.css and
                only then becomes the second grid column, so on a phone the
                form is not rendered visually at all — but it IS in the DOM, as
                it is in the source, so the markup does not change shape with
                the viewport.

                "Kitchen worktops" is the default because the guides ship the
                select with no `selected` attribute, and a bare <select> shows
                its first <option>. /trade/ is the page that pre-selects
                "Commercial"; a guide about worktop thickness must not.
              */}
              <aside className="lead-aside">
                <QuickForm defaultService="Kitchen worktops" />
              </aside>
            </div>
          ) : (
            run.blocks.map((block, j) => <GuideSection key={`${i}-${j}`} block={block} />)
          ),
        )}
      </article>
      <GuideSections blocks={bands} />
    </>
  );
}
