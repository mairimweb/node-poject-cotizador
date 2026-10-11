import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONFIG,
  exportJSONString,
  makeInvoiceNumber,
  nextCounter,
  oldestQuote,
  parseJSON,
  resolveNumberCollision,
  validateQuote
} from '@/domain';
import type { Quote } from '@/domain';
import { useAuth } from '@/features/auth/AuthContext';
import { EmisorBrand } from './EmisorBrand';
import { HistoryList } from './HistoryList';
import { QuoteForm } from './QuoteForm';
import { Sidebar } from './Sidebar';
import { Spotlight } from './Spotlight';
import { Totals } from './Totals';
import { openPrintPreview } from './print';
import { newDraft, toStoredQuote } from './quote-model';
import type { Draft, DraftItem, Notice, View } from './quote-model';
import { quoteRepository } from './quote-repository';

const EMPTY_MESSAGE: Notice = { text: '', kind: '' };
const MESSAGE_TIMEOUT_MS = 6000;

function downloadBlob(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function QuoteWorkspace() {
  const { logout } = useAuth();
  const [view, setView] = useState<View>('new');
  const [draft, setDraft] = useState<Draft>(() => newDraft());
  const [quotes, setQuotes] = useState<Quote[]>(() => quoteRepository.all());
  const [counter, setCounter] = useState<number>(CONFIG.NUMBERING.START);
  const [message, setMessage] = useState<Notice>(EMPTY_MESSAGE);
  const [showErrors, setShowErrors] = useState(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
    };
  }, []);

  const notify = useCallback((text: string, kind: Notice['kind'] = 'info') => {
    setMessage({ text, kind });
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(EMPTY_MESSAGE), MESSAGE_TIMEOUT_MS);
  }, []);

  const commit = useCallback((next: Quote[]) => {
    quoteRepository.replace(next);
    setQuotes(next);
  }, []);

  const existingNumbers = useCallback(
    () => quotes.map((quote) => quote.number ?? ''),
    [quotes]
  );

  const handleNavigate = useCallback((next: View) => {
    setView(next);
    setShowErrors(false);
    window.scrollTo({ top: 0 });
  }, []);

  const handleField = useCallback(
    (field: 'client' | 'currency' | 'discount' | 'validUntil' | 'notes', value: string) => {
      setDraft((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const handleItemChange = useCallback(
    (index: number, field: keyof DraftItem, value: string) => {
      setDraft((current) => ({
        ...current,
        items: current.items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
      }));
    },
    []
  );

  const handleAddItem = useCallback(() => {
    setDraft((current) => ({
      ...current,
      items: [...current.items, { description: '', quantity: '', price: '' }]
    }));
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setDraft((current) => {
      const items = current.items.filter((_, i) => i !== index);
      return { ...current, items: items.length ? items : [{ description: '', quantity: '', price: '' }] };
    });
  }, []);

  const handleSave = useCallback(() => {
    const errors = validateQuote(draft);
    if (Object.keys(errors).length) {
      setShowErrors(true);
      notify('Revisá los campos marcados antes de guardar.', 'error');
      return;
    }
    const number = resolveNumberCollision(
      makeInvoiceNumber(counter, draft.client),
      existingNumbers()
    );
    const quote = toStoredQuote(draft, number);
    const next = [...quotes, quote];
    commit(next);
    setCounter((value) => value + 1);
    setShowErrors(false);
    const fullAfter = next.length >= CONFIG.QUOTE_LIMIT;
    if (!fullAfter) setDraft(newDraft());
    setView('history');
    notify(
      fullAfter
        ? `Slot lleno (${CONFIG.QUOTE_LIMIT}): usá "Reemplazar cotización más antigua" o exportá un respaldo.`
        : `Cotización guardada: ${number}.`,
      fullAfter ? 'warn' : 'ok'
    );
  }, [commit, counter, draft, existingNumbers, notify, quotes]);

  const handleSaveOverwrite = useCallback(() => {
    const errors = validateQuote(draft);
    if (Object.keys(errors).length) {
      setShowErrors(true);
      notify('Revisá los campos marcados antes de guardar.', 'error');
      return;
    }
    const oldest = oldestQuote(quotes);
    if (!oldest) return;
    const confirmed = window.confirm(
      `Se reemplazará la cotización más antigua:\n${oldest.number} · ${oldest.client}\n\n¿Continuar?`
    );
    if (!confirmed) return;

    const number = resolveNumberCollision(
      makeInvoiceNumber(counter, draft.client),
      existingNumbers().filter((n) => n !== oldest.number)
    );
    const replacement = toStoredQuote(draft, number);
    const next = quotes.map((quote) => (quote === oldest ? replacement : quote));
    commit(next);
    setCounter((value) => value + 1);
    setDraft(newDraft());
    setShowErrors(false);
    setView('history');
    notify(`Se reemplazó ${oldest.number}. Nueva cotización: ${number}.`, 'ok');
  }, [commit, counter, draft, existingNumbers, notify, quotes]);

  const handleDelete = useCallback(
    (number: string) => {
      const quote = quotes.find((item) => item.number === number);
      if (!quote) return;
      if (!window.confirm(`¿Eliminar ${quote.number} (${quote.client})?\nEsta acción no se puede deshacer.`))
        return;
      commit(quotes.filter((item) => item.number !== number));
      notify('Cotización eliminada.', 'ok');
    },
    [commit, notify, quotes]
  );

  const handleClearHistory = useCallback(() => {
    if (!quotes.length) return;
    if (!window.confirm('Se borrarán todas las cotizaciones guardadas. Esta acción no se puede deshacer.\n\n¿Continuar?'))
      return;
    commit([]);
    setDraft(newDraft());
    notify('Historial borrado.', 'ok');
  }, [commit, notify, quotes.length]);

  const handleExport = useCallback(() => {
    downloadBlob(
      exportJSONString(quotes, counter),
      `cotizaciones-respaldo-${new Date().toISOString().slice(0, 10)}.json`
    );
    notify(`Respaldo exportado (${quotes.length} cotizaciones).`, 'ok');
  }, [counter, notify, quotes]);

  const handleImport = useCallback(
    async (file: File) => {
      const isJson = file.type === 'application/json' || /\.json$/i.test(file.name);
      if (!isJson) {
        notify('El respaldo debe ser un archivo en formato JSON (.json).', 'error');
        return;
      }
      try {
        const text = await file.text();
        const parsed = parseJSON(text);
        if (quotes.length + parsed.quotes.length > CONFIG.QUOTE_LIMIT) {
          notify(
            'No es posible importar: los slots de almacenamiento no son suficientes.',
            'error'
          );
          return;
        }
        if (!window.confirm(`Se importarán ${parsed.quotes.length} cotizaciones. ¿Continuar?`)) return;
        commit(parsed.quotes);
        setCounter(nextCounter(parsed.quotes, parsed.counter ?? counter));
        setDraft(newDraft());
        setView('history');
        notify(`Importadas ${parsed.quotes.length} cotizaciones.`, 'ok');
      } catch (error) {
        notify(error instanceof Error ? error.message : 'No se pudo importar el archivo.', 'error');
      }
    },
    [commit, counter, notify, quotes.length]
  );

  const handlePreview = useCallback((quote: Quote) => {
    openPrintPreview(quote);
  }, []);

  return (
    <div className="app-shell">
      <div className="sidebar-pane">
        <EmisorBrand />
        <Sidebar
          view={view}
          quotesCount={quotes.length}
          onNavigate={handleNavigate}
          onClearHistory={handleClearHistory}
          onLogout={() => void logout()}
        />
        {view === 'new' && <Totals draft={draft} />}
      </div>
      <main className="app-main" id="app-main">
        <Spotlight />
        {view === 'new' ? (
          <QuoteForm
            draft={draft}
            quotesFull={quotes.length >= CONFIG.QUOTE_LIMIT}
            message={message}
            showErrors={showErrors}
            onField={handleField}
            onItemChange={handleItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onSave={handleSave}
            onSaveOverwrite={handleSaveOverwrite}
          />
        ) : (
          <HistoryList
            quotes={quotes}
            message={message}
            onNew={() => handleNavigate('new')}
            onPreview={handlePreview}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
      </main>
    </div>
  );
}
