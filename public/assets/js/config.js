export const CONFIG = {
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
// SESSION_TTL_MINUTES: 1