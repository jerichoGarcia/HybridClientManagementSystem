// Civil dates are calendar days, not instants. Return null for invalid input.
export function formatCivilDate(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y), month = Number(m), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) return null;
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]} ${day}, ${year}`;
}

// Only explicitly offset-qualified ISO timestamps are interpreted as instants.
export function formatManilaTimestamp(value: string, includeTime = false): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,7})?)?(Z|[+-]\d{2}:\d{2})$/i.exec(value);
  if (!match || !formatCivilDate(match[1]) || Number(match[2]) > 23 || Number(match[3]) > 59 || (match[4] && Number(match[4]) > 59)) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", year: "numeric", month: "short", day: "numeric", ...(includeTime ? { hour: "numeric", minute: "2-digit", second: "2-digit" } : {}) }).format(date);
}
