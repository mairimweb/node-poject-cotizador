import printCss from '@/styles/print.css?inline';
import stylesCss from '@/styles/styles.css?inline';
import variablesCss from '@/styles/variables.css?inline';
import { EMISOR, calculateQuote, escapeHtml, formatDate, formatISODate, formatMoney } from '@/domain';
import type { Quote } from '@/domain';

function buildPrintSheet(quote: Quote): string {
  const calc = calculateQuote(quote);
  const currency = quote.currency;

  const discountLine =
    calc.discount > 0
      ? `<div class="pt-line"><span>Descuento (${calc.discount}%)</span><strong>−${formatMoney(calc.discountAmount, currency)}</strong></div>`
      : '';

  const taxLine =
    calc.taxRate > 0
      ? `<div class="pt-line"><span>IVA (${Math.round(calc.taxRate * 100)}%)</span><strong>${formatMoney(calc.tax, currency)}</strong></div>`
      : '';

  const rows = calc.items
    .map(
      (item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(item.description)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${formatMoney(item.price, currency)}</td>
        <td class="num">${formatMoney(item.subtotal, currency)}</td>
      </tr>`
    )
    .join('');

  const highlight = EMISOR.highlight;
  const highlightBlock =
    highlight && (highlight.title || highlight.text)
      ? `<div class="pf-highlight">
         ${highlight.title ? `<p class="pf-highlight-title">${escapeHtml(highlight.title)}</p>` : ''}
         ${highlight.text ? `<p class="pf-highlight-text">${escapeHtml(highlight.text)}</p>` : ''}
       </div>`
      : '';

  const websiteHref = EMISOR.website
    ? `https://${String(EMISOR.website).replace(/^https?:\/\//i, '')}`
    : '';

  return `
    <header class="print-header">
      <div class="ph-brand">
        <img class="ph-logo" src="/user-logo.png" alt="" />
        <div class="ph-text">
          <h1>${escapeHtml(EMISOR.name)}</h1>
          <p>${escapeHtml(EMISOR.cuit)}</p>
          <p>${escapeHtml(EMISOR.address)}</p>
          ${EMISOR.email ? `<p>${escapeHtml(EMISOR.email)}</p>` : ''}
          ${EMISOR.website ? `<p class="ph-web"><a href="${escapeHtml(websiteHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(EMISOR.website)}</a></p>` : ''}
        </div>
      </div>
      <div class="ph-doc">
        <p class="ph-doc-label">Cotización</p>
        <p class="ph-doc-number">${escapeHtml(quote.number)}</p>
        <p>Fecha: ${escapeHtml(formatDate(quote.date))}</p>
        <p>Válida hasta: <strong>${escapeHtml(formatISODate(quote.validUntil))}</strong></p>
      </div>
    </header>

    <section class="print-client">
      <h2>Cliente</h2>
      <p>${escapeHtml(quote.client)}</p>
    </section>

    <table class="print-items">
      <thead>
        <tr><th>#</th><th>Descripción</th><th class="num">Cant.</th><th class="num">P. unitario</th><th class="num">Subtotal</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="print-totals">
      <div class="pt-line"><span>Subtotal</span><strong>${formatMoney(calc.subtotal, currency)}</strong></div>
      ${discountLine}
      <div class="pt-line"><span>Base</span><strong>${formatMoney(calc.base, currency)}</strong></div>
      ${taxLine}
      <div class="pt-line pt-total"><span>Total</span><strong>${formatMoney(calc.total, currency)}</strong></div>
    </div>

    ${quote.notes ? `<section class="print-notes"><h2>Notas</h2><p>${escapeHtml(quote.notes)}</p></section>` : ''}

    <footer class="print-footer">
      <div class="pf-contacts">
        <div class="pf-contact">
          <span class="pf-label">Servicio técnico</span>
          <span class="pf-value">${escapeHtml(EMISOR.service)}</span>
        </div>
        <div class="pf-contact">
          <span class="pf-label">Venta / Alquiler</span>
          <span class="pf-value">${escapeHtml(EMISOR.serviceSell)}</span>
        </div>
      </div>
      ${highlightBlock}
      <p class="pf-rights">Gracias por confiar en <strong>${escapeHtml(EMISOR.name)}</strong>, todos los derechos reservados.</p>
    </footer>`;
}

export function documentTitleFor(quote: Quote): string {
  return `${quote.number} - ${quote.client}`;
}

export function openPrintPreview(quote: Quote | null): void {
  if (!quote) return;
  const win = window.open('', '_blank');
  if (!win) return;

  const sheetHtml = buildPrintSheet(quote);
  const cssTag = (content: string) => `<style>${content}</style>`;

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(documentTitleFor(quote))}</title>
  ${cssTag(variablesCss)}
  ${cssTag(stylesCss)}
  ${cssTag(printCss)}
  <style>
    html, body { background: var(--color-backdrop); margin: 0; }
    body { display: flex; flex-direction: column; align-items: center; padding: 24px 0; }
    #print-sheet { margin: 0; }
    .print-toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 10px 0;
      background: color-mix(in srgb, var(--color-backdrop) 92%, transparent);
      backdrop-filter: blur(4px);
      box-shadow: var(--shadow-sm);
    }
    .print-toolbar button {
      font: inherit;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-print {
      background: var(--color-primary);
      color: var(--color-surface);
      border: 1px solid var(--color-primary);
    }
    .btn-print:hover { background: var(--color-primary-dark); }
    .btn-close {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border-strong);
    }
    .btn-close:hover { background: var(--color-surface-alt); }
    @media print {
      html, body { background: var(--color-surface); padding: 0; }
      .print-toolbar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-toolbar">
    <button type="button" class="btn-print" onclick="window.print()">Imprimir / Exportar PDF</button>
    <button type="button" class="btn-close" onclick="window.close()">Cerrar</button>
  </div>
  <div id="print-sheet" class="print-sheet">${sheetHtml}</div>
  <script>
    window.addEventListener('afterprint', function () {
      window.close();
    });
  </script>
</body>
</html>`);
  win.document.close();
  if (typeof win.focus === 'function') win.focus();
}
