import type { AuditEvent } from "./types";

export default function AuditEventDetails({ event }: { event: AuditEvent }) {
  const fields: [string, string | undefined][] = [["Event Identifier",event.id],["Timestamp",event.timestamp],["Category",event.category],["Action",event.action],["Actor",event.actor],["Target",[event.targetEntity,event.targetReference].filter(Boolean).join(" · ")],["Outcome",event.outcome],["Summary",event.summary],["Correlation ID",event.correlationId]];
  return <section aria-label="Audit event details" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm sm:p-6"><h2 className="text-xl font-bold">Audit Event Details</h2><p className="mt-2 text-sm text-slate-600">Future authorized record view; access controls are not implemented.</p><dl className="mt-5 grid gap-5 sm:grid-cols-2">{fields.map(([label,value]) => <div key={label} className="min-w-0"><dt className="text-sm font-semibold text-slate-600">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{value?.trim() || "Not available"}</dd></div>)}</dl></section>;
}
