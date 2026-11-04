import type { Appointment } from "./types";

// Reserved for a future authorized service; no sample appointments are supplied.
export default function AppointmentDetails({ appointment }: { appointment: Appointment }) {
  const fields = [["Appointment ID", appointment.id], ["Patient", appointment.patient], ["Date", appointment.date], ["Start time", appointment.time], ["Duration", `${appointment.durationMinutes} minutes`], ["Visit reason", appointment.visitReason], ["Assigned dentist", appointment.provider], ["Status", appointment.status], ["Notes", appointment.notes || "Not provided"]];
  return <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold text-slate-900">Appointment Details</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-900">{value}</dd></div>)}</dl></section>;
}
