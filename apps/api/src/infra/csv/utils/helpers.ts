// CSV parsing helpers

export function parseAmountString(v: string): number {
  if (!v) return NaN;
  const s = v.replace(/[^0-9,.-]/g, '').trim();
  if (s === '') return NaN;
  const hasComma = s.indexOf(',') !== -1;
  const hasDot = s.indexOf('.') !== -1;
  let normalized = s;
  if (hasComma && hasDot) {
    // decide decimal separator by last occurrence
    if (s.lastIndexOf('.') > s.lastIndexOf(',')) {
      // dot is decimal, remove commas
      normalized = s.replace(/,/g, '');
    } else {
      // comma is decimal
      normalized = s.replace(/\./g, '').replace(/,/g, '.');
    }
  } else if (hasComma && !hasDot) {
    normalized = s.replace(/,/g, '.');
  } else {
    normalized = s;
  }
  return Number(normalized);
}

export function parseDateString(v: string): string {
  if (!v) return v;
  const trimmed = v.trim();
  // handle dd/mm/yyyy
  const m = trimmed.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/);
  if (m) {
    const [dd, mm, yyyy] = trimmed.split(/[\/\-]/);
    const iso = `${yyyy.padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    return iso;
  }
  return trimmed;
}
