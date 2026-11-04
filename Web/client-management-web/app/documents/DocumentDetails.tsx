import type { PatientDocument } from "./types";

export default function DocumentDetails({ document }: { document: PatientDocument }) {
  const fields: [string, string | undefined][] = [["Document ID", document.id], ["Title", document.title], ["Category", document.category], ["Related Patient", document.patient], ["File Type", document.fileType], ["File Size", document.fileSize], ["Document Date", document.documentDate], ["Uploaded Date", document.uploadedDate], ["Uploaded By", document.uploadedBy], ["Description", document.description], ["Related Clinical Record", document.relatedClinicalRecord], ["Status", document.status]];
  return <section aria-label="Document details" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm sm:p-6"><h2 className="text-xl font-bold">Document Details</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm font-semibold text-slate-600">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{value?.trim() || "Not available"}</dd></div>)}</dl></section>;
}
