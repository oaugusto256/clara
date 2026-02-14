import { describe, expect, it } from 'vitest';
import { removeInstallmentInfo } from '../../../../src/infra/csv/utils/helpers';

describe('removeInstallmentInfo', () => {
  it('removes simple parcela patterns', () => {
    expect(removeInstallmentInfo('airbnb * hm2qbw2aey - parcela 4/4')).toBe('airbnb * hm2qbw2aey');
    expect(removeInstallmentInfo('airbnb * hmcdwmty9h - parcela 3/6')).toBe('airbnb * hmcdwmty9h');
    expect(removeInstallmentInfo('airbnb * hmjaqffw8d - parcela 5/6')).toBe('airbnb * hmjaqffw8d');
  });

  it('removes parcela with/without dash and spaces', () => {
    expect(removeInstallmentInfo('foo parcela 1/2')).toBe('foo');
    expect(removeInstallmentInfo('foo - parcela 1/2')).toBe('foo');
    expect(removeInstallmentInfo('foo  -   parcela 1/2')).toBe('foo');
  });

  it('removes parcela in the middle of text', () => {
    expect(removeInstallmentInfo('foo - parcela 1/2 bar')).toBe('foo bar');
    expect(removeInstallmentInfo('parcela 1/2 foo')).toBe('foo');
  });

  it('is case insensitive', () => {
    expect(removeInstallmentInfo('foo - PARCELA 1/2')).toBe('foo');
    expect(removeInstallmentInfo('foo - Parcela 1/2')).toBe('foo');
  });

  it('does not remove unrelated text', () => {
    expect(removeInstallmentInfo('foo bar')).toBe('foo bar');
    expect(removeInstallmentInfo('parcela')).toBe('parcela');
    expect(removeInstallmentInfo('foo parcela')).toBe('foo parcela');
  });
});
