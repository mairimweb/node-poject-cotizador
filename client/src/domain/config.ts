import type { Currency } from './types';

export interface AppConfig {
  AUTH_ENABLED: boolean;
  QUOTE_LIMIT: number;
  CURRENCIES: readonly Currency[];
  DEFAULT_CURRENCY: string;
  NUMBERING: {
    START: number;
    SLUG_ACTIVE: boolean;
  };
  VALIDITY_DAYS_DEFAULT: number;
  SESSION_TTL_DAYS: number;
  SESSION_TTL_MINUTES: number | null;
}

export const CONFIG: AppConfig = {
  AUTH_ENABLED: false,
  QUOTE_LIMIT: 20,
  CURRENCIES: [
    { code: 'AR$', name: 'Peso Argentino', tax: 0.21 },
    { code: 'U$D', name: 'Dólar estadounidense', tax: 0 }
  ],
  DEFAULT_CURRENCY: 'AR$',
  NUMBERING: {
    START: 2022700,
    SLUG_ACTIVE: true
  },
  VALIDITY_DAYS_DEFAULT: 30,
  SESSION_TTL_DAYS: 7,
  SESSION_TTL_MINUTES: null
};
