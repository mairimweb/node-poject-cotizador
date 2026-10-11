import { describe, expect, it, vi } from 'vitest';
import { escapeHtml, formatISODate, formatMoney, formatTimeAgo } from './formatters';

describe('formatMoney', () => {
  it('formatea montos con separador de miles y coma decimal (paridad legacy)', () => {
    expect(formatMoney(1234567.891, 'AR$')).toBe('AR$ 1.234.567,89');
    expect(formatMoney(-1234.5, 'U$D')).toBe('−U$D 1.234,50');
    expect(formatMoney(0, 'AR$')).toBe('AR$ 0,00');
  });

  it('mantiene el comportamiento original ante valores no numéricos', () => {
    expect(formatMoney('abc', 'AR$')).toBe('AR$ NaN,undefined');
  });

  it('usa AR$ como moneda por defecto', () => {
    expect(formatMoney(10)).toBe('AR$ 10,00');
  });
});

describe('formatISODate', () => {
  it('convierte AAAA-MM-DD a DD/MM/AAAA', () => {
    expect(formatISODate('2026-09-03')).toBe('03/09/2026');
  });

  it('devuelve vacío para valores falsy', () => {
    expect(formatISODate('')).toBe('');
    expect(formatISODate(null)).toBe('');
    expect(formatISODate(undefined)).toBe('');
  });
});

describe('formatTimeAgo', () => {
  it('calcula rangos relativos (paridad legacy)', () => {
    const now = new Date(2026, 8, 3, 12, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(now);
    try {
      expect(formatTimeAgo(new Date(2026, 8, 3))).toBe('hoy');
      expect(formatTimeAgo(new Date(2026, 8, 2))).toBe('hace 1 día');
      expect(formatTimeAgo(new Date(2026, 7, 31))).toBe('hace 3 días');
      expect(formatTimeAgo(new Date(2026, 7, 24))).toBe('hace 1 semana');
      expect(formatTimeAgo(new Date(2026, 7, 14))).toBe('hace 2 semanas');
      expect(formatTimeAgo(new Date(2026, 6, 20))).toBe('hace 1 mes');
      expect(formatTimeAgo(new Date(2026, 3, 3))).toBe('hace 5 meses');
      expect(formatTimeAgo(new Date(2025, 7, 3))).toBe('hace 1 año');
      expect(formatTimeAgo(new Date(2024, 7, 3))).toBe('hace 2 años');
    } finally {
      vi.useRealTimers();
    }
  });

  it('devuelve vacío para valores inválidos', () => {
    expect(formatTimeAgo('')).toBe('');
    expect(formatTimeAgo('no-es-fecha')).toBe('');
  });
});

describe('escapeHtml', () => {
  it('escapa los caracteres peligrosos', () => {
    expect(escapeHtml('<a href="x">&\'</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;'
    );
  });

  it('convierte null/undefined en cadena vacía', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});
