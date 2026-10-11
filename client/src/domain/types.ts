export interface Currency {
  readonly code: string;
  readonly name: string;
  readonly tax: number;
}

export type ItemNumber = number | '';

export interface QuoteItem {
  description: string;
  quantity: ItemNumber;
  price: ItemNumber;
}

export interface QuoteItemInput {
  description?: unknown;
  quantity?: number | string;
  price?: number | string;
}

export interface Quote {
  number: string | null;
  date: string;
  validUntil: string;
  client: string;
  currency: string;
  discount: number;
  items: QuoteItem[];
  notes: string;
  status: string;
}

export interface CalculatedItem {
  description: string;
  quantity: number | string;
  price: number | string;
  subtotal: number;
}

export interface QuoteCalculation {
  items: CalculatedItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  base: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: Currency;
}

export type QuoteErrors = Record<string, string>;
