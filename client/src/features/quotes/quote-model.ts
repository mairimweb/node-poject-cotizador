import { createQuote } from '@/domain';
import type { Quote } from '@/domain';

export type View = 'new' | 'history';

export interface Notice {
  text: string;
  kind: '' | 'ok' | 'error' | 'warn' | 'info';
}

export interface DraftItem {
  description: string;
  quantity: number | string;
  price: number | string;
}

export interface Draft {
  client: string;
  currency: string;
  discount: number | string;
  validUntil: string;
  notes: string;
  items: DraftItem[];
}

export function emptyItem(): DraftItem {
  return { description: '', quantity: '', price: '' };
}

export function newDraft(): Draft {
  const quote = createQuote({ items: [emptyItem()] });
  return {
    client: quote.client,
    currency: quote.currency,
    discount: quote.discount,
    validUntil: quote.validUntil,
    notes: quote.notes,
    items: quote.items
  };
}

export function toStoredQuote(draft: Draft, number: string): Quote {
  const quote = createQuote({
    client: draft.client,
    currency: draft.currency,
    discount: draft.discount,
    items: draft.items,
    notes: draft.notes,
    validUntil: draft.validUntil
  });
  return { ...quote, number };
}
