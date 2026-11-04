export default function ReportEmptyState({ label = "Report data is unavailable." }: { label?: string }) {
  return <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm leading-6 text-slate-600"><p>{label}<br />An authorized reporting service is required.</p></div>;
}
