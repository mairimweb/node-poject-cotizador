import { describe, expect, it } from 'vitest';
import {
  calculateQuote,
  createQuote,
  isItemComplete,
  lineTotal,
  makeInvoiceNumber,
  makeQuoteNumber,
  makeValidUntil,
  resolveNumberCollision,
  round2,
  sanitizeClientSlug,
  toISODate,
  validateQuote
} from './quote';

describe('round2', () => {
  it('redondea a 2 decimales sin perder precisión (paridad legacy)', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(2.005)).toBe(2.01);
    expect(round2(-1.005)).toBe(-1);
    expect(round2('3.14159')).toBe(3.14);
  });
});

describe('toISODate / makeValidUntil', () => {
  it('serializa la fecha local en AAAA-MM-DD', () => {
    expect(toISODate(new Date(2026, 8, 3))).toBe('2026-09-03');
  });

  it('suma días de validez al default de config', () => {
    expect(makeValidUntil(new Date(2026, 8, 3), 30)).toBe('2026-10-03');
  });
});

describe('sanitizeClientSlug', () => {
  it('normaliza acentos, símbolos y espacios', () => {
    expect(sanitizeClientSlug('José María')).toBe('Jose_Maria');
    expect(sanitizeClientSlug('  **Elevatronix**  ')).toBe('Elevatronix');
    expect(sanitizeClientSlug('')).toBe('');
    expect(sanitizeClientSlug(null)).toBe('');
  });

  it('limita el slug a 32 caracteres', () => {
    expect(sanitizeClientSlug('a'.repeat(50))).toBe('a'.repeat(32));
  });
});

describe('makeQuoteNumber / makeInvoiceNumber', () => {
  it('genera número con slug y timestamp local', () => {
    expect(makeQuoteNumber('José María', new Date(2026, 8, 3, 10, 15, 0))).toBe(
      'Jose_Maria_20260903-101500'
    );
  });

  it('usa CLIENTE cuando no hay slug', () => {
    expect(makeQuoteNumber('', new Date(2026, 8, 3, 10, 15, 0))).toBe('CLIENTE_20260903-101500');
  });

  it('genera número de factura según el contador', () => {
    expect(makeInvoiceNumber(2022700, 'Elevatronix')).toBe('2022700_Elevatronix');
    expect(makeInvoiceNumber(5, 'José')).toBe('5_Jose');
  });
});

describe('resolveNumberCollision', () => {
  it('devuelve el número base si no colisiona', () => {
    expect(resolveNumberCollision('X', [])).toBe('X');
  });

  it('agrega sufijo alfabético ante colisión', () => {
    expect(resolveNumberCollision('X', ['X'])).toBe('X_A');
    expect(resolveNumberCollision('X', ['X', 'X_A'])).toBe('X_B');
  });
});

describe('createQuote', () => {
  it('normaliza los campos del borrador (paridad legacy)', () => {
    const date = new Date(2026, 8, 3, 10, 15, 0);
    const quote = createQuote({
      client: 'Elevatronix',
      currency: 'AR$',
      discount: 10,
      items: [
        { description: 'Servicio', quantity: 2, price: 1000.555 },
        { description: 'Otra', quantity: '1', price: '' }
      ],
      notes: 'nota',
      number: 'N1',
      date,
      validUntil: '2026-10-01'
    });

    expect(quote).toEqual({
      number: 'N1',
      date: date.toISOString(),
      validUntil: '2026-10-01',
      client: 'Elevatronix',
      currency: 'AR$',
      discount: 10,
      items: [
        { description: 'Servicio', quantity: 2, price: 1000.555 },
        { description: 'Otra', quantity: 1, price: '' }
      ],
      notes: 'nota',
      status: 'generado'
    });
  });

  it('usa validUntil = fecha cuando no se pasa una', () => {
    const date = new Date(2026, 8, 3);
    expect(createQuote({ date }).validUntil).toBe('2026-09-03');
  });
});

describe('lineTotal', () => {
  it('multiplica cantidad por precio redondeado', () => {
    expect(lineTotal({ quantity: 2, price: 1000.555 })).toBe(2001.11);
    expect(lineTotal({ quantity: '', price: '' })).toBe(0);
  });
});

describe('calculateQuote', () => {
  it('calcula subtotal, descuento e IVA (paridad legacy)', () => {
    const result = calculateQuote({
      currency: 'AR$',
      discount: 10,
      items: [
        { description: 'Servicio', quantity: 2, price: 1000.555 },
        { description: 'Otra', quantity: 1, price: '' }
      ]
    });

    expect(result).toEqual({
      items: [
        { description: 'Servicio', quantity: 2, price: 1000.555, subtotal: 2001.11 },
        { description: 'Otra', quantity: 1, price: '', subtotal: 0 }
      ],
      subtotal: 2001.11,
      discount: 10,
      discountAmount: 200.11,
      base: 1801,
      tax: 378.21,
      taxRate: 0.21,
      total: 2179.21,
      currency: { code: 'AR$', name: 'Peso Argentino', tax: 0.21 }
    });
  });

  it('topea el descuento en 100', () => {
    const result = calculateQuote({
      currency: 'AR$',
      discount: 200,
      items: [{ description: 'a', quantity: 1, price: 100 }]
    });
    expect(result.discount).toBe(100);
    expect(result.discountAmount).toBe(100);
    expect(result.total).toBe(0);
  });

  it('usa la moneda por defecto si no coincide ninguna', () => {
    const result = calculateQuote({ currency: 'XXX', items: [] });
    expect(result.currency.code).toBe('AR$');
  });
});

describe('validateQuote', () => {
  it('reporta todos los errores de un borrador vacío', () => {
    expect(validateQuote({ client: '', items: [], discount: -1, validUntil: '' })).toEqual({
      client: 'Ingresá el nombre del cliente.',
      items: 'Agregá al menos un item.',
      discount: 'El descuento debe estar entre 0 y 100.',
      validUntil: 'Elegí una fecha de validez.'
    });
  });

  it('valida cada item y la fecha de validez', () => {
    expect(
      validateQuote({
        client: 'X',
        items: [{ description: '', quantity: 0, price: -5 }],
        discount: 50,
        validUntil: '2020-01-01'
      })
    ).toEqual({
      'item-0-description': 'Agregá una descripción.',
      'item-0-quantity': 'La cantidad debe ser mayor a 0.',
      'item-0-price': 'El precio no puede ser negativo.',
      validUntil: 'La fecha de validez debe ser posterior a hoy.'
    });
  });

  it('no reporta errores con un borrador válido', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(
      validateQuote({
        client: 'Cliente',
        items: [{ description: 'Item', quantity: 1, price: 0 }],
        discount: 0,
        validUntil: toISODate(future)
      })
    ).toEqual({});
  });
});

describe('isItemComplete', () => {
  it('determina si un item tiene datos completos', () => {
    expect(isItemComplete({ description: 'x', quantity: 1, price: 0 })).toBe(true);
    expect(isItemComplete({ description: '', quantity: 1, price: 1 })).toBe(false);
    expect(isItemComplete({ description: 'x', quantity: '', price: 1 })).toBe(false);
  });
});
