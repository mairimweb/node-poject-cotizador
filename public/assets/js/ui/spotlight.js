import { EMISOR } from '../emisor.js';
import { escapeHtml } from '../formatters.js';

export function spotlightMarkup() {
  const h = EMISOR.highlight;
  if (!h || (!h.title && !h.text)) return '';
  return `
    <aside class="spotlight" role="note">
      ${h.title ? `<p class="spotlight-title">${escapeHtml(h.title)}</p>` : ''}
      ${h.text ? `<p class="spotlight-text">${escapeHtml(h.text)}</p>` : ''}
    </aside>`;
}
