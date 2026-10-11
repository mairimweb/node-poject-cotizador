import { formatMoney, lineTotal } from '@/domain';
import type { QuoteErrors } from '@/domain';
import type { DraftItem } from './quote-model';

interface ItemsTableProps {
  items: DraftItem[];
  currency: string;
  errors?: QuoteErrors;
  onChange: (index: number, field: keyof DraftItem, value: string) => void;
  onRemove: (index: number) => void;
}

export function ItemsTable({ items, currency, errors, onChange, onRemove }: ItemsTableProps) {
  return (
    <table className="items-table">
      <thead>
        <tr>
          <th className="col-desc">Descripción</th>
          <th className="col-qty">Cant.</th>
          <th className="col-price">Precio</th>
          <th className="col-st">Subtotal</th>
          <th className="col-rm"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const subtotal =
            item.quantity === '' || item.price === ''
              ? '—'
              : formatMoney(lineTotal(item), currency);
          const descriptionError = errors?.[`item-${index}-description`];
          const quantityError = errors?.[`item-${index}-quantity`];
          const priceError = errors?.[`item-${index}-price`];
          return (
            <tr key={index} data-index={index}>
              <td className="col-desc">
                <input
                  className="item-desc"
                  type="text"
                  value={item.description}
                  placeholder="Descripción…"
                  aria-label={`Descripción del item ${index + 1}`}
                  autoComplete="off"
                  onChange={(event) => onChange(index, 'description', event.target.value)}
                />
                {descriptionError && <p className="field-error">{descriptionError}</p>}
              </td>
              <td className="col-qty" data-label="Cant.">
                <input
                  className="item-qty"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={item.quantity}
                  placeholder="0"
                  aria-label={`Cantidad del item ${index + 1}`}
                  onChange={(event) => onChange(index, 'quantity', event.target.value)}
                />
                {quantityError && <p className="field-error">{quantityError}</p>}
              </td>
              <td className="col-price" data-label="Precio">
                <input
                  className="item-price"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={item.price}
                  placeholder="0"
                  aria-label={`Precio del item ${index + 1}`}
                  onChange={(event) => onChange(index, 'price', event.target.value)}
                />
                {priceError && <p className="field-error">{priceError}</p>}
              </td>
              <td className="col-st" data-label="Subtotal">
                <span className="item-subtotal">{subtotal}</span>
              </td>
              <td className="col-rm">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onRemove(index)}
                  aria-label={`Quitar item ${index + 1}`}
                >
                  ✕
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
