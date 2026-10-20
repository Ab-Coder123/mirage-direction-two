import { describe, expect, it } from 'vitest';
import { slugify, validateNewSlug, cn, formatBatchCode, formatPharmaTemperature } from '@mirage/utils';

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('Folate B12')).toBe('folate-b12');
  });

  it('collapses punctuation runs into a single hyphen', () => {
    expect(slugify('Osteo-Guard D3 + K2')).toBe('osteo-guard-d3-k2');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify('  --Inositol!!  ')).toBe('inositol');
  });

  it('strips diacritics', () => {
    expect(slugify('Crème Brûlée')).toBe('creme-brulee');
  });

  it('returns an empty string when there are no Latin letters or digits', () => {
    expect(slugify('مكمل غذائي')).toBe('');
    expect(slugify('!!!')).toBe('');
    expect(slugify('')).toBe('');
  });

  it('is idempotent', () => {
    const once = slugify('Man Edge 30 Caps');
    expect(slugify(once)).toBe(once);
  });
});

describe('validateNewSlug', () => {
  it('accepts a unique name and returns its slug', () => {
    expect(validateNewSlug('Osteo-Guard', ['sympdca', 'novamirage'])).toEqual({
      ok: true,
      slug: 'osteo-guard',
    });
  });

  it('rejects a name that produces an empty slug', () => {
    const result = validateNewSlug('مكمل', []);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('empty');
  });

  it('rejects a name whose slug already exists, regardless of casing/punctuation', () => {
    const result = validateNewSlug('  SymPDCA!! ', ['sympdca']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('duplicate');
      expect(result.message).toContain('sympdca');
    }
  });
});

describe('formatting helpers', () => {
  it('cn merges conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4', false && 'hidden', 'text-sm')).toBe('px-4 text-sm');
  });

  it('formatBatchCode normalises to a LOT- prefixed alphanumeric code', () => {
    expect(formatBatchCode('batch-me/2026 108')).toBe('LOT-BATCHME2026108');
  });

  it('formatPharmaTemperature adds a + sign for positive values only', () => {
    expect(formatPharmaTemperature(4.44)).toBe('+4.4°C');
    expect(formatPharmaTemperature(-80)).toBe('-80.0°C');
    expect(formatPharmaTemperature(0)).toBe('0.0°C');
  });
});
