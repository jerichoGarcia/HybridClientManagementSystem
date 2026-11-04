"use client";

import { useState, useSyncExternalStore } from "react";
import ReportEmptyState from "./ReportEmptyState";
import type { ReportCategory, ReportingPeriod, ReportTableColumn } from "./types";

const categories: ReportCategory[] = ["Patients", "Registrations", "Appointments", "Clinical Records", "Financial", "Follow-ups & Tasks", "Activity"];
const periods: ReportingPeriod[] = ["Today", "This Week", "This Month", "This Year", "Custom Range"];
const topics: Record<ReportCategory, string[]> = {
  Patients: ["Patient Population", "Patient Status Distribution", "New Patients Over Time", "Active vs Inactive Patients"],
  Registrations: ["Submitted Registrations", "Under Review", "Approved", "Rejected", "Corrections Requested", "Registration Conversion Rates"],
  Appointments: ["Scheduled Appointments", "Completed Appointments", "Cancelled Appointments", "No-shows", "Appointment Trends", "Provider Workload"],
  "Clinical Records": ["Consultations", "Diagnoses", "Dental Procedures", "Treatment Plans", "Treatment Completion", "Follow-up Recommendations"],
  Financial: ["Invoice Totals", "Payments Received", "Outstanding Balances", "Overdue Invoices", "Revenue Trends", "Payment Methods"],
  "Follow-ups & Tasks": ["Open Tasks", "Due Tasks", "Overdue Tasks", "Completed Tasks", "Patient Follow-up Performance"],
  Activity: ["System Actions", "Patient Record Changes", "Staff Activity", "Audit History", "Security Events"],
};
const columns: ReportTableColumn[] = [{ key: "period", label: "Reporting Period" }, { key: "measure", label: "Measure" }, { key: "count", label: "Count" }, { key: "percentage", label: "Percentage" }];
const panel = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const control = "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

// Calendar arithmetic uses UTC components as a neutral representation, never local-to-UTC conversion.
function dayString(date: Date) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`; }
function manilaToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function subscribeDate(callback: () => void) {
  const timer = window.setInterval(callback, 60_000);
  return () => window.clearInterval(timer);
}
function serverDate() { return ""; }
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(0); d.setUTCFullYear(year, month - 1, day); d.setUTCHours(0, 0, 0, 0);
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}
function rangeFor(period: ReportingPeriod, today: string): [string, string] {
  const [year, month, day] = today.split("-").map(Number);
  const start = new Date(0); start.setUTCFullYear(year, month - 1, day); start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  if (period === "This Week") { const offset = (start.getUTCDay() + 6) % 7; start.setUTCDate(start.getUTCDate() - offset); end.setTime(start.getTime()); end.setUTCDate(end.getUTCDate() + 6); }
  if (period === "This Month") { start.setUTCDate(1); end.setUTCFullYear(year, month, 0); }
  if (period === "This Year") { start.setUTCFullYear(year, 0, 1); end.setUTCFullYear(year, 11, 31); }
  return [dayString(start), dayString(end)];
}

function MetricCard({ label }: { label: string }) {
  return <div className={`${panel} p-5`}><p className="text-sm font-semibold text-slate-700">{label}</p><p aria-label={`${label}: unavailable`} className="mt-3 text-3xl font-bold text-slate-700">—</p><p className="mt-2 text-xs text-slate-500">Data unavailable.</p></div>;
}

export default function ReportsPage() {
  const [category, setCategory] = useState<ReportCategory>("Patients");
  const [period, setPeriod] = useState<ReportingPeriod>("This Month");
  const today = useSyncExternalStore(subscribeDate, manilaToday, serverDate);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const invalid = period === "Custom Range" && (!validDate(start) || !validDate(end) || start > end);
  const range = period === "Custom Range" ? invalid ? null : [start, end] : today ? rangeFor(period, today) : null;
  const rangeLabel = range ? `${range[0]} to ${range[1]}` : period === "Custom Range" ? "Select a valid custom range" : "Loading Philippine date…";
  return <main className="min-h-screen min-w-0 bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl space-y-7"><header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Clinic operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Reports &amp; Analytics</h1><p className="mt-2 text-sm leading-6 text-slate-600">Review patient activity, clinic operations, and reporting performance.</p></header><div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Development preview.</strong> Reports &amp; Analytics is currently a frontend preview. Most report data, exports, and restricted reporting services are not yet available. Staff role-based access is not yet enforced.</div><section aria-label="Reporting overview" className="grid gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">{["Total Patients", "Registrations", "Appointments", "Treatments", "Total Billed", "Outstanding Balance"].map((item) => <MetricCard key={item} label={item} />)}</section><section className={`${panel} p-4 sm:p-6`}><h2 className="text-lg font-bold">Reporting period</h2><p className="mt-1 text-sm text-slate-600">Philippine time · Weeks run Monday through Sunday. This local selection is not connected to report data.</p><div className="mt-4 grid gap-4 sm:grid-cols-3"><div><label htmlFor="report-period" className="text-sm font-semibold text-slate-700">Period</label><select id="report-period" value={period} onChange={(e) => setPeriod(e.target.value as ReportingPeriod)} className={`mt-2 ${control}`}>{periods.map((p) => <option key={p}>{p}</option>)}</select></div>{period === "Custom Range" && <><div><label htmlFor="report-start" className="text-sm font-semibold text-slate-700">Start date</label><input id="report-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} aria-invalid={invalid} aria-describedby={invalid ? "range-error" : undefined} className={`mt-2 ${control}`} /></div><div><label htmlFor="report-end" className="text-sm font-semibold text-slate-700">End date</label><input id="report-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} aria-invalid={invalid} aria-describedby={invalid ? "range-error" : undefined} className={`mt-2 ${control}`} /></div></>}</div>{invalid && <p id="range-error" role="alert" className="mt-3 text-sm text-red-700">Enter valid start and end dates; the end date must not be before the start date.</p>}<p className="mt-4 text-sm font-semibold text-slate-700">Selected period: {rangeLabel}</p></section><nav aria-label="Report categories" className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"><div className="flex w-max min-w-full gap-1">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`min-h-11 whitespace-nowrap rounded-lg px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${category === item ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{item}</button>)}</div></nav><section aria-labelledby="report-section-heading" className="space-y-4"><div><h2 id="report-section-heading" className="text-2xl font-bold">{category} reports</h2><p className="mt-1 text-sm text-slate-600">{rangeLabel} · Preview only; no report data has been filtered.</p></div><div className="grid gap-4 lg:grid-cols-2">{topics[category].map((topic) => <article key={topic} className={`${panel} min-w-0 p-5`}><h3 className="font-bold text-slate-900">{topic}</h3><p className="mb-4 mt-1 text-sm text-slate-500">{rangeLabel}</p><ReportEmptyState /></article>)}</div></section><section className={`${panel} min-w-0 p-5`}><h2 className="text-lg font-bold">Report table</h2><p className="mt-1 text-sm text-slate-600">Aggregate columns are a future design and contain no records.</p><div role="region" aria-label="Report table, scroll horizontally" tabIndex={0} className="mt-4 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[620px] text-left text-sm"><caption className="sr-only">{category} report table</caption><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600"><tr>{columns.map((column) => <th key={column.key} scope="col" className="px-4 py-3">{column.label}</th>)}</tr></thead><tbody /></table></div><p className="py-6 text-center text-sm text-slate-500">No report data is available.</p></section><section className={`${panel} p-5`}><h2 className="text-lg font-bold">Exports</h2><p className="mt-1 text-sm text-slate-600">Report exports require authorized reporting services.</p><div className="mt-4 flex flex-wrap gap-3">{["Export CSV", "Export PDF", "Print Report"].map((item) => <button type="button" key={item} disabled className="min-h-11 cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500">{item}</button>)}</div></section></div></main>;
}
