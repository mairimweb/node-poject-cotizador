import type { Quote } from '@/domain';

let store: Quote[] = [];

export const quoteRepository = {
  all(): Quote[] {
    return store;
  },
  replace(quotes: Quote[]): void {
    store = quotes;
  }
};
