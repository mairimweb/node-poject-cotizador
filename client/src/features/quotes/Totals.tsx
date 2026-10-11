import { calculateQuote, formatMoney } from '@/domain';
import type { Draft } from './quote-model';

export function Totals({ draft }: { draft: Draft }) {
  const calc = calculateQuote({
    currency: draft.currency,
    discount: draft.discount,
    items: draft.items
  });
  const currency = draft.currency;

  return (
    <aside className="card totals" aria-label="Totales">
      <div className="totals-line">
        <span>Subtotal</span>
        <strong>{formatMoney(calc.subtotal, currency)}</strong>
      </div>
      {calc.discount > 0 && (
        <div className="totals-line">
          <span>Descuento ({calc.discount}%)</span>
          <strong>−{formatMoney(calc.discountAmount, currency)}</strong>
        </div>
      )}
      <div className="totals-line">
        <span>Base</span>
        <strong>{formatMoney(calc.base, currency)}</strong>
      </div>
      {calc.taxRate > 0 && (
        <div className="totals-line">
          <span>IVA ({Math.round(calc.taxRate * 100)}%)</span>
          <strong>{formatMoney(calc.tax, currency)}</strong>
        </div>
      )}
      <div className="totals-line total">
        <span>Total</span>
        <strong>{formatMoney(calc.total, currency)}</strong>
      </div>
      {calc.taxRate === 0 && (
        <p className="totals-note">Sin IVA · el total es el importe base.</p>
      )}
    </aside>
  );
}
