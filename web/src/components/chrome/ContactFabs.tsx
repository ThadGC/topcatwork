import { PhonePath, WhatsAppPathsSolid } from './glyphs';
import {
  CALL_FAB_LABEL,
  PHONE_TEL,
  WA_FAB_LABEL,
  WHATSAPP_URL,
} from './nav-data';

/**
 * `.wa-fab` + `.call-fab` — the two floating action buttons, rich pages only.
 *
 * Zero JavaScript. Every appearance and disappearance is CSS reacting to
 * state something else already owns:
 *
 *   .mbar.on ~ ...        the sticky bar is up, so stand down   (<=1120px)
 *   html.bar-always ...   this page's bar is always up          (display:none)
 *   html.nav-open ...     the menu sheet is open                (<=720px)
 *   html.kb-open ...      a soft keyboard is up                 (<=1120px)
 *   html.cine-on ...      the film is running                   (index only)
 *
 * `.call-fab` is `display:none` by default and only becomes `display:flex`
 * (at right:70px, beside the WhatsApp button) below 720px. Both vanish
 * entirely at 1121px and up. So: neither on desktop, WhatsApp alone on a
 * tablet, both on a phone.
 *
 * On the 171 lite pages `html.bar-always` would `display:none` these anyway,
 * but they are simply not rendered there — matching the source HTML.
 */
export function ContactFabs() {
  return (
    <>
      <a
        className="wa-fab"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={WA_FAB_LABEL}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <WhatsAppPathsSolid />
        </svg>
      </a>
      <a className="call-fab" href={PHONE_TEL} aria-label={CALL_FAB_LABEL}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <PhonePath />
        </svg>
      </a>
    </>
  );
}
