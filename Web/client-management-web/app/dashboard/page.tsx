"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Patient = {
  id: number;
  clientNumber?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  statusId: number;
  dateCreated?: string | null;
};

const statuses = [
  { id: 1, name: "Active", bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", icon: "+" },
  { id: 3, name: "Pending", bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700", icon: "◷" },
  { id: 2, name: "Inactive", bar: "bg-slate-400", badge: "bg-slate-100 text-slate-700", icon: "−" },
  { id: 4, name: "Archived", bar: "bg-violet-500", badge: "bg-violet-50 text-violet-700", icon: "▣" },
] as const;

const panel = "rounded-2xl border border-slate-200 bg-white shadow-sm";

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadPatients() {
      try {
        const response = await fetch("http://localhost:5110/api/Clients", { signal: controller.signal });
        if (!response.ok) throw new Error("Patient request failed");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected patient response");
        setPatients(data as Patient[]);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }
    void loadPatients();
    return () => controller.abort();
  }, []);

  const summary = useMemo(() => {
    if (!patients) return null;
    const counts = new Map(statuses.map((status) => [status.id as number, 0]));
    let unknown = 0;
    for (const patient of patients) {
      if (counts.has(patient.statusId)) counts.set(patient.statusId, (counts.get(patient.statusId) ?? 0) + 1);
      else unknown++;
    }
    const recent = patients.map((patient) => ({ patient, timestamp: patient.dateCreated ? Date.parse(patient.dateCreated) : NaN }))
      .filter(({ timestamp }) => Number.isFinite(timestamp))
      .sort((a, b) => b.timestamp - a.timestamp || b.patient.id - a.patient.id)
      .slice(0, 5);
    return { counts, unknown, recent };
  }, [patients]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Dental Clinic Overview</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1><p className="mt-2 text-sm text-slate-600">Welcome to your clinic overview. Find patient information and upcoming features here.</p></div>
          <Link href="/Clients?add=1" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">+ Add New Patient</Link>
        </header>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Patient information is unavailable. Check that the patient management API is running, then refresh this page.</div>}

        <section aria-label="Patient summary" aria-busy={!patients && !error} className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-5">
          {[{ name: "Total", icon: "♙", badge: "bg-blue-50 text-blue-700", count: patients?.length }, ...statuses.map((status) => ({ ...status, count: summary?.counts.get(status.id) }))].map((item) => (
            <div key={item.name} className={`${panel} p-5`}><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-slate-600">{item.name} Patients</p><span aria-hidden="true" className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg font-semibold ${item.badge}`}>{item.icon}</span></div><p className="mt-4 text-3xl font-bold tabular-nums">{error ? <span className="text-base font-medium text-slate-500">Unavailable</span> : patients ? item.count : <span className="text-base font-medium text-slate-500">Loading…</span>}</p></div>
          ))}
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          <section className={`${panel} min-w-0 p-5 sm:p-6 lg:col-span-2`}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Recently Added Patients</h2><p className="mt-1 text-sm text-slate-500">The latest patient records by creation date.</p></div><Link href="/Clients" className="text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600">View all patients →</Link></div>
            {!patients ? <p className="py-10 text-center text-sm text-slate-500">{error ? "Patient records are unavailable." : "Loading patient records…"}</p> : summary?.recent.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">{patients.length ? "No patients have a valid creation date." : "No patients have been added yet."}</p> : (
              <ul className="mt-5 divide-y divide-slate-100">{summary?.recent.map(({ patient }) => {
                const status = statuses.find((item) => item.id === patient.statusId);
                const name = [patient.firstName, patient.middleName, patient.lastName].filter((part) => part?.trim()).join(" ") || "Name unavailable";
                return <li key={patient.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4"><div className="min-w-0"><p className="break-words font-semibold text-slate-900">{name}</p><p className="mt-1 text-xs text-slate-500">{patient.clientNumber || "Number unavailable"} · {formatDate(patient.dateCreated)}</p></div><div className="flex items-center gap-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status?.badge ?? "bg-slate-100 text-slate-700"}`}>{status?.name ?? "Unknown"}</span><Link href={`/Clients/${patient.id}`} className="text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600">View Profile<span className="sr-only"> for {name}</span></Link></div></li>;
              })}</ul>
            )}
          </section>

          <section className={`${panel} p-5 sm:p-6`}><h2 className="text-lg font-bold">Patient Status Overview</h2><p className="mt-1 text-sm text-slate-500">Distribution across all patients.</p>
            {!patients ? <p className="py-10 text-center text-sm text-slate-500">{error ? "Status data is unavailable." : "Loading status data…"}</p> : patients.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No patient statuses to display yet.</p> : <div className="mt-6 space-y-4">{[...statuses.map((status) => ({ ...status, count: summary?.counts.get(status.id) ?? 0 })), ...(summary?.unknown ? [{ id: 0, name: "Unknown", bar: "bg-slate-600", count: summary.unknown }] : [])].map((status) => <div key={status.id}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="text-slate-700">{status.name}</span><span className="font-semibold tabular-nums">{status.count}</span></div><div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${status.bar}`} style={{ width: `${status.count / patients.length * 100}%` }} /></div></div>)}</div>}
          </section>
        </div>

        <section aria-label="Upcoming features" className="grid gap-4 md:grid-cols-3">{[{ title: "Appointments", items: ["Today's Appointments", "Upcoming Appointments"], icon: "▦" }, { title: "Registration Review", items: ["Pending QR Registrations"], icon: "▤" }, { title: "Activity", items: ["Recent Patient Activity"], icon: "◷" }].map((section) => <div key={section.title} className={`${panel} p-5`}><div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">{section.icon}</span><h2 className="font-bold">{section.title}</h2></div><ul className="mt-4 divide-y divide-slate-100">{section.items.map((item) => <li key={item} className="flex items-center justify-between gap-3 py-3 text-sm text-slate-600"><span>{item}</span><span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">Coming Soon</span></li>)}</ul></div>)}</section>
      </div>
    </main>
  );
}
