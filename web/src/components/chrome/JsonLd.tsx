/**
 * `<script type="application/ld+json">`.
 *
 * The extractor keeps each page's structured-data graph whole, so it is
 * re-emitted rather than rebuilt: the stone pages carry BreadcrumbList +
 * LocalBusiness, the collection adds CollectionPage + ItemList over all 132
 * stones, and compare adds WebPage.
 *
 * `dangerouslySetInnerHTML` is the only way to put raw JSON inside a script
 * tag from JSX — React would otherwise escape the quotes. The payload is
 * build-time data from our own extractor, not user input. `<` is escaped
 * anyway so a stray `</script>` in a description can never close the tag.
 */
export function JsonLd({ data }: { data: unknown }) {
  const graphs = Array.isArray(data) ? data : [data];
  return (
    <>
      {graphs.map((graph, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
