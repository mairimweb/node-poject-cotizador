import { calculateQuote, formatDateTime, formatMoney, formatTimeAgo } from '@/domain';
import type { Quote } from '@/domain';
import type { Notice } from './quote-model';

interface HistoryListProps {
  quotes: Quote[];
  message: Notice;
  onNew: () => void;
  onPreview: (quote: Quote) => void;
  onDelete: (number: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

function BackupBar({
  quotesCount,
  onExport,
  onImport
}: {
  quotesCount: number;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  const slotsFree = quotesCount === 0;
  const importTitle = slotsFree
    ? ''
    : 'No es posible importar: los slots de almacenamiento no son suficientes.';
  return (
    <div className="backup-bar">
      <button type="button" className="btn btn-ghost btn-sm" onClick={onExport}>
        Exportar respaldo (JSON)
      </button>
      <label
        className={`btn btn-ghost btn-sm file-label${slotsFree ? '' : ' is-disabled'}`}
        title={importTitle}
      >
        Importar respaldo (JSON)
        <input
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
            event.target.value = '';
          }}
        />
      </label>
      <span className="backup-hint">
        El respaldo JSON evita perder cotizaciones ante el límite de slots.
      </span>
    </div>
  );
}

function HistoryCard({
  quote,
  onPreview,
  onDelete
}: {
  quote: Quote;
  onPreview: (quote: Quote) => void;
  onDelete: (number: string) => void;
}) {
  const calc = calculateQuote({ currency: quote.currency, discount: quote.discount, items: quote.items });
  const itemCount = quote.items.length;
  return (
    <li className="history-card" data-number={quote.number}>
      <div className="hc-head">
        <div>
          <h2 className="hc-number mono">{quote.number}</h2>
          <p className="hc-date">{formatDateTime(quote.date)}</p>
        </div>
        <div className="hc-badges">
          <span className="badge badge-time" title={formatDateTime(quote.date)}>
            {formatTimeAgo(quote.date)}
          </span>
          <span className="badge">{quote.currency}</span>
        </div>
      </div>
      <p className="hc-client">{quote.client}</p>
      <p className="hc-meta">
        {itemCount} item{itemCount === 1 ? '' : 's'} · {formatMoney(calc.total, quote.currency)}
      </p>
      <div className="hc-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPreview(quote)}>
          Vista previa
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(quote.number ?? '')}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}

export function HistoryList({
  quotes,
  message,
  onNew,
  onPreview,
  onDelete,
  onExport,
  onImport
}: HistoryListProps) {
  if (!quotes.length) {
    return (
      <>
        <p className={`form-message ${message.kind}`} role="status" aria-live="polite">
          {message.text}
        </p>
        <div className="empty-history">
          <p>No hay cotizaciones guardadas todavía.</p>
          <p>Creá tu primera cotización ahora.</p>
          <button type="button" className="btn btn-primary" onClick={onNew}>
            Crear cotización
          </button>
        </div>
        <BackupBar quotesCount={quotes.length} onExport={onExport} onImport={onImport} />
      </>
    );
  }

  const newestFirst = [...quotes].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <>
      <p className={`form-message ${message.kind}`} role="status" aria-live="polite">
        {message.text}
      </p>
      <ul className="history-list">
        {newestFirst.map((quote) => (
          <HistoryCard key={quote.number ?? ''} quote={quote} onPreview={onPreview} onDelete={onDelete} />
        ))}
      </ul>
      <BackupBar quotesCount={quotes.length} onExport={onExport} onImport={onImport} />
    </>
  );
}
