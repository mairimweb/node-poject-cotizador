import { CONFIG, isItemComplete, makeValidUntil, toISODate, validateQuote } from '@/domain';
import { ItemsTable } from './ItemsTable';
import type { Draft, DraftItem, Notice } from './quote-model';

interface QuoteFormProps {
  draft: Draft;
  quotesFull: boolean;
  message: Notice;
  showErrors: boolean;
  onField: (
    field: 'client' | 'currency' | 'discount' | 'validUntil' | 'notes',
    value: string
  ) => void;
  onItemChange: (index: number, field: keyof DraftItem, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSave: () => void;
  onSaveOverwrite: () => void;
}

export function QuoteForm({
  draft,
  quotesFull,
  message,
  showErrors,
  onField,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSave,
  onSaveOverwrite
}: QuoteFormProps) {
  const errors = validateQuote({
    client: draft.client,
    items: draft.items,
    discount: draft.discount,
    validUntil: draft.validUntil
  });
  const valid = Object.keys(errors).length === 0;
  const lastItem = draft.items[draft.items.length - 1];
  const canAdd = isItemComplete(lastItem);
  const validUntilWarned =
    !draft.validUntil ||
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.validUntil) ||
    draft.validUntil <= toISODate(new Date());
  const invalid = (key: string) => (showErrors && errors[key] ? 'true' : 'false');

  return (
    <form id="quote-form" onSubmit={(event) => event.preventDefault()}>
      <div className="card form-client">
        <label className="field" htmlFor="client">
          <span>Cliente</span>
          <input
            id="client"
            name="client"
            type="text"
            value={draft.client}
            placeholder="Nombre de la persona o empresa"
            autoComplete="organization"
            aria-invalid={invalid('client')}
            onChange={(event) => onField('client', event.target.value)}
          />
        </label>
        {showErrors && errors.client && <p className="field-error">{errors.client}</p>}
        <div className="field-row">
          <label className="field" htmlFor="currency">
            <span>Moneda</span>
            <select
              id="currency"
              name="currency"
              value={draft.currency}
              onChange={(event) => onField('currency', event.target.value)}
            >
              {CONFIG.CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} · {currency.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor="discount">
            <span>Descuento global (%)</span>
            <input
              id="discount"
              name="discount"
              type="number"
              min={0}
              max={100}
              step="any"
              inputMode="decimal"
              value={draft.discount}
              aria-invalid={invalid('discount')}
              onChange={(event) => onField('discount', event.target.value)}
            />
          </label>
        </div>
        {showErrors && errors.discount && <p className="field-error">{errors.discount}</p>}
        <label className="field" htmlFor="validUntil">
          <span>Válida hasta</span>
          <input
            id="validUntil"
            name="validUntil"
            type="date"
            min={makeValidUntil(new Date(), 1)}
            value={draft.validUntil}
            required
            className={validUntilWarned ? 'is-warning' : ''}
            aria-invalid={invalid('validUntil')}
            onChange={(event) => onField('validUntil', event.target.value)}
          />
          {validUntilWarned && (
            <p className="field-warning">La fecha de validez debe ser posterior a hoy.</p>
          )}
        </label>
      </div>

      <div className="card form-items">
        <h2 className="card-title">Items</h2>
        <ItemsTable
          items={draft.items}
          currency={draft.currency}
          errors={showErrors ? errors : undefined}
          onChange={onItemChange}
          onRemove={onRemoveItem}
        />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAddItem}
          disabled={!canAdd}
          title={canAdd ? '' : 'Completá la fila actual para agregar otro item'}
        >
          + Agregar item
        </button>
      </div>

      <div className="card form-notes">
        <label className="field" htmlFor="notes" style={{ marginBottom: 0 }}>
          <span>Notas</span>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Condiciones, validez, observaciones…"
            value={draft.notes}
            onChange={(event) => onField('notes', event.target.value)}
          />
        </label>
      </div>

      <div className="action-bar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={quotesFull}
          title={valid ? '' : 'Completá los campos requeridos para guardar.'}
        >
          Guardar cotización
        </button>
        {quotesFull && (
          <button
            type="button"
            className="btn btn-warning"
            onClick={onSaveOverwrite}
            disabled={!valid}
            title={valid ? '' : 'Completá los campos requeridos.'}
          >
            Reemplazar cotización más antigua
          </button>
        )}
      </div>
      <p className={`form-message ${message.kind}`} role="status" aria-live="polite">
        {message.text}
      </p>
    </form>
  );
}
