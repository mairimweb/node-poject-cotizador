import { CONFIG } from './config';
import { makeValidUntil } from './quote';
import type { Quote } from './types';

export const BACKUP_APP = 'cotizador-virtual';
export const BACKUP_VERSION = '0.1';

export function isValidQuote(value: unknown): value is Quote {
  const q = value as Partial<Quote> | null;
  return Boolean(
    q &&
      typeof q === 'object' &&
      typeof q.number === 'string' &&
      typeof q.client === 'string' &&
      typeof q.currency === 'string' &&
      Array.isArray(q.items)
  );
}

export function normalizeQuote(q: Quote): Quote {
  if (q.validUntil && /^\d{4}-\d{2}-\d{2}$/.test(String(q.validUntil))) return q;
  const date = q.date ? new Date(q.date) : new Date();
  return { ...q, validUntil: makeValidUntil(Number.isNaN(date.getTime()) ? new Date() : date) };
}

function asQuoteArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { quotes?: unknown }).quotes)) {
    return (data as { quotes: unknown[] }).quotes;
  }
  return [];
}

export function parseDatabase(raw: string | null): Quote[] {
  if (!raw) return [];
  const data = JSON.parse(raw) as unknown;
  return asQuoteArray(data).filter(isValidQuote).map(normalizeQuote);
}

export function isAtLimit(quotes: readonly Quote[]): boolean {
  return quotes.length >= CONFIG.QUOTE_LIMIT;
}

export function oldestQuote(quotes: readonly Quote[]): Quote | null {
  return quotes[0] ?? null;
}

export function nextCounter(quotes: readonly Quote[], current: number): number {
  const re = new RegExp(`^(\\d{${String(CONFIG.NUMBERING.START).length}})(?:_|$)`);
  const maxUsed = quotes.reduce((max, q) => {
    const match = re.exec(String(q.number ?? ''));
    const value = match ? Number.parseInt(match[1], 10) : null;
    return value !== null && value > max ? value : max;
  }, 0);
  return Math.max(current, maxUsed + 1);
}

export function exportJSONString(quotes: readonly Quote[], counter: number): string {
  return JSON.stringify(
    {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      counter,
      quotes
    },
    null,
    2
  );
}

function isValidQuoteForImport(q: Quote): boolean {
  if (!isValidQuote(q)) return false;
  if (!String(q.number).trim() || !String(q.client).trim() || !String(q.currency).trim()) return false;
  if (!(typeof q.date === 'string' && !Number.isNaN(Date.parse(q.date)))) return false;
  if (q.validUntil !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(q.validUntil))) return false;
  const discount = Number(q.discount);
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) return false;
  if (!Array.isArray(q.items) || !q.items.length) return false;
  return q.items.every(
    (item) =>
      item &&
      typeof item.description === 'string' &&
      String(item.description).trim() !== '' &&
      Number.isFinite(Number(item.quantity)) &&
      Number(item.quantity) > 0 &&
      Number.isFinite(Number(item.price)) &&
      Number(item.price) >= 0
  );
}

export interface ParsedBackup {
  quotes: Quote[];
  counter: number | null;
}

export function parseJSON(text: string): ParsedBackup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  const backup = data as { app?: unknown; version?: unknown; quotes?: unknown; counter?: unknown };
  if (
    !backup ||
    typeof backup !== 'object' ||
    Array.isArray(backup) ||
    backup.app !== BACKUP_APP ||
    backup.version !== BACKUP_VERSION
  ) {
    throw new Error('Este archivo no fue generado por el cotizador. El formato es incompatible.');
  }
  const quotes = backup.quotes;
  if (!Array.isArray(quotes) || !quotes.length) {
    throw new Error('El archivo no contiene cotizaciones.');
  }
  if (!(quotes as unknown[]).every((q) => isValidQuoteForImport(q as Quote))) {
    throw new Error('El formato del archivo contiene errores y es incompatible.');
  }
  const counter = Number.parseInt(String(backup.counter), 10);
  return {
    quotes: (quotes as Quote[]).map(normalizeQuote),
    counter: Number.isFinite(counter) && counter > 0 ? counter : null
  };
}
