// Civil dates are YYYY-MM-DD in Asia/Manila. UTC is used only as a stable
// arithmetic/display carrier for those calendar fields, never to convert an appointment time.
export function manilaToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function asDate(value: string): Date { const [year, month, day] = value.split("-").map(Number); return new Date(Date.UTC(year, month - 1, day, 12)); }
function civil(date: Date): string { return `${date.getUTCFullYear().toString().padStart(4, "0")}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`; }
export function addDays(value: string, count: number): string { const date = asDate(value); date.setUTCDate(date.getUTCDate() + count); return civil(date); }
export function addMonths(value: string, count: number): string { const date = asDate(value); const day = date.getUTCDate(); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + count); const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12)).getUTCDate(); date.setUTCDate(Math.min(day, last)); return civil(date); }
export function weekStart(value: string): string { return addDays(value, -((asDate(value).getUTCDay() + 6) % 7)); }
export function monthGrid(value: string): string[] { const start = weekStart(`${value.slice(0, 7)}-01`); return Array.from({ length: 42 }, (_, index) => addDays(start, index)); }
export function formatCivil(value: string, options: Intl.DateTimeFormatOptions): string { return new Intl.DateTimeFormat("en-PH", { ...options, timeZone: "UTC" }).format(asDate(value)); }
