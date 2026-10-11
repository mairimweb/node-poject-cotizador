import { EMISOR } from '../emisor.js';
import { escapeHtml } from '../formatters.js';
import { logoMarkup } from './logo.js';

export function emisorBrandMarkup(base = '') {
  const websiteHref = EMISOR.website
    ? `https://${String(EMISOR.website).replace(/^https?:\/\//i, '')}`
    : '';
  return `
    <div class="view-header-emisor">
      ${logoMarkup(base)}
      <p class="vh-name">${escapeHtml(EMISOR.name)}</p>
      <p>${escapeHtml(EMISOR.cuit)}</p>
      <p>${escapeHtml(EMISOR.email)}</p>
      ${EMISOR.website ? `<p><a class="vh-link" href="${escapeHtml(websiteHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(EMISOR.website)}</a></p>` : ''}
    </div>`;
}