import type { RegistrationApplication } from "./types";

type DetailField = { label: string; value: string };

function DetailSection({ title, fields }: { title: string; fields: DetailField[] }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-slate-900">{title}</h2>{fields.length ? <dl className="mt-4 grid gap-4 sm:grid-cols-2">{fields.map((field, index) => <div key={`${field.label}-${index}`} className="min-w-0"><dt className="text-sm text-slate-500">{field.label}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-900">{field.value || "Not provided"}</dd></div>)}</dl> : <p className="mt-3 text-sm text-slate-500">No information available.</p>}</section>;
}

// Not mounted until an authorized backend supplies a real application.
export default function RegistrationApplicationDetails({ application }: { application: RegistrationApplication }) {
  return <div className="space-y-5"><DetailSection title="Application Overview" fields={[{ label: "Reference Number", value: application.referenceNumber }, { label: "Applicant Name", value: application.applicantName }, { label: "Registration Status", value: application.status }, { label: "Date Submitted", value: application.submittedAt }]} /><DetailSection title="Personal Information" fields={application.personalInformation} /><DetailSection title="Contact Information" fields={application.contactDetails} /><DetailSection title="Address Information" fields={application.addressInformation} /><DetailSection title="Submission Details" fields={application.submissionDetails} /><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-bold text-slate-900">Review History</h2>{application.reviewHistory.length ? <ul className="mt-4 space-y-3">{application.reviewHistory.map((entry) => <li key={entry.id} className="break-words text-sm text-slate-700">{entry.description} <span className="text-slate-500">{entry.occurredAt}</span></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No review history available.</p>}</section></div>;
}
