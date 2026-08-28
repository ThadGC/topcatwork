/* ==========================================================================
   THE NINE ENQUIRY SERVICES — the single source of truth for the `service`
   field, shared by the aside's `#qfService` select and the service pages'
   seeded enquiry card.

   ⚠️ IT LIVES IN ITS OWN MODULE ON PURPOSE. The obvious home is
   lib/services.ts, but that module opens with `import raw from
   '@/data/services.json'`, and <QuickForm/> is also the /trade/ page's form.
   Importing the list from there would pull the whole services dataset into
   /trade/'s bundle to read nine strings. This file imports nothing.

   The order is the source's (trade/index.html), which is the order the select
   renders, so it is not to be sorted.
   ========================================================================== */

export const SERVICE_OPTIONS = [
  'Kitchen worktops',
  'Kitchen islands',
  'Splashbacks',
  'Bathrooms and vanity tops',
  'Outdoor kitchens',
  'Fireplaces',
  'Dining tables',
  'Commercial',
  'Something else',
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];
