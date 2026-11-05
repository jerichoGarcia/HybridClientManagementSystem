"use client";

import { useEffect } from "react";

export type PatientToastNotice = { id: number; message: string };

export default function PatientToast({ notice, onDismiss }: { notice: PatientToastNotice | null; onDismiss: (id: number) => void }) {
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => onDismiss(notice.id), 1500);
    return () => window.clearTimeout(timeout);
  }, [notice, onDismiss]);

  if (!notice) return null;

  return <div role="status" aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end"><div className="flex max-w-sm items-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-900 shadow-lg shadow-slate-900/15"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 shrink-0 text-success"><path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" /></svg><span>{notice.message}</span></div></div>;
}
