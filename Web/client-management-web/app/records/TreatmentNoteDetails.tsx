import type { ClinicalTreatmentNote } from "./types";

// Prepared for an authorized future data source; never mounted with sample data.
export default function TreatmentNoteDetails({ note }: { note: ClinicalTreatmentNote }) {
  const fields = [["Note Date", note.date], ["Patient", note.patient], ["Related Consultation", note.relatedConsultation], ["Related Diagnosis or Procedure", note.relatedDiagnosisOrProcedure], ["Attending Dentist", note.attendingDentist], ["Treatment Summary", note.summary], ["Follow-up Instructions", note.followUpInstructions]];
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold text-slate-900">Treatment Note Details</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm text-slate-900">{value || "Not provided"}</dd></div>)}</dl></section>;
}
