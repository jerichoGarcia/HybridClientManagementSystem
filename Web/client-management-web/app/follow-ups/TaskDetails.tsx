import type { ClinicTask } from "./types";

const missing = "Not available";

// A calendar date is not an instant: format its parts without changing the day.
function formatDate(value?: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return missing;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return missing;
  return new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" }).format(date);
}

function formatTime(value?: string): string {
  if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return missing;
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

function formatTimestamp(value?: string): string {
  if (!value || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return missing;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return missing;
  return new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export default function TaskDetails({ task }: { task: ClinicTask }) {
  const entries: [string, string | undefined][] = [
    ["Task Identifier", task.id], ["Task Title", task.title], ["Description", task.description],
    ["Priority", task.priority], ["Status", task.status], ["Due Date", formatDate(task.dueDate)],
    ["Due Time (Philippine time)", formatTime(task.dueTime)], ["Assigned Staff", task.staff],
    ["Related Patient", task.patient], ["Created Date", formatTimestamp(task.createdAt)],
    ["Last Updated Date", formatTimestamp(task.updatedAt)],
  ];
  return <section aria-label="Task details" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm sm:p-6"><h2 className="text-xl font-bold">Task Details</h2><dl className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2">{entries.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm font-semibold text-slate-600">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{value?.trim() || missing}</dd></div>)}</dl></section>;
}
