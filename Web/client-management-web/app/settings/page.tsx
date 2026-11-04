"use client";

import { useState } from "react";
import type { SettingsSection } from "./types";

const sections: SettingsSection[] = ["Clinic Information", "Appointment Preferences", "Categories & Statuses", "Notifications", "Security & Access", "Backup & Recovery"];
const control = "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-100 disabled:text-slate-600";
const disabledButton = "min-h-11 cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500";

function ClinicPreview() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const fields = [{key:"name",label:"Clinic Name",required:true}, {key:"phone",label:"Contact Phone"}, {key:"email",label:"Email Address",type:"email"}, {key:"address",label:"Clinic Address"}, {key:"hours",label:"Operating Hours"}, {key:"website",label:"Website URL",type:"url"}];
  function validate() {
    const next: Record<string,string> = {};
    if (!values.name?.trim()) next.name = "Enter a clinic name.";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (values.website) { try { const url = new URL(values.website); if (url.protocol !== "https:" && url.protocol !== "http:") next.website = "Enter an http or https website URL."; } catch { next.website = "Enter a valid website URL."; } }
    setErrors(next); setChecked(Object.keys(next).length === 0);
  }
  return <><p className="mt-1 text-sm text-slate-600">Use fictional values only. Entries are temporary and discarded when you leave this section.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((f) => { const id = `clinic-preview-${f.key}`; return <div key={f.key}><label htmlFor={id} className="text-sm font-semibold text-slate-700">{f.label}{f.required ? " *" : " (optional)"}</label><input id={id} type={f.type || "text"} maxLength={f.key === "email" ? 254 : 200} value={values[f.key] || ""} onChange={(e) => { setValues((v) => ({...v,[f.key]:e.target.value})); setErrors((old) => ({...old,[f.key]:""})); setChecked(false); }} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key] ? `${id}-error` : undefined} className={`mt-2 ${control}`} />{errors[f.key] && <p id={`${id}-error`} className="mt-1 text-sm text-red-700">{errors[f.key]}</p>}</div>; })}</div><p aria-live="polite" className="mt-4 text-sm text-slate-600">{checked ? "Preview fields checked. Saving remains unavailable." : Object.values(errors).some(Boolean) ? "Please correct the highlighted fields." : "Settings are not connected."}</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={validate} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Check preview fields</button><button type="button" disabled className={disabledButton}>Save Changes</button></div></>;
}

const items: Record<Exclude<SettingsSection,"Clinic Information">,string[]> = {
  "Appointment Preferences": ["Default Appointment Duration", "Scheduling Start Time", "Scheduling End Time", "Working Days", "Booking Lead Time", "Cancellation Window"],
  "Categories & Statuses": ["Appointment Types", "Appointment Statuses", "Treatment Categories", "Document Categories", "Task Priorities", "Patient Statuses"],
  "Notifications": ["Appointment Reminders", "Follow-up Notifications", "Staff Task Alerts", "Email Notifications", "SMS Notifications"],
  "Security & Access": ["Password Policies", "Staff Login Settings", "Session Management", "Account Lockout", "Role-Based Permissions", "Audit Retention"],
  "Backup & Recovery": ["Backup Status", "Last Successful Backup", "Backup Frequency", "Data Retention", "Recovery Procedures"],
};

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("Clinic Information");
  return <main className="min-h-screen min-w-0 bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl space-y-7"><header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Clinic administration</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Settings</h1><p className="mt-2 text-sm leading-6 text-slate-600">Configure clinic information and operational preferences.</p></header><div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Development preview.</strong> Settings is currently a frontend preview. Changes cannot be saved until secure administrative services and authorization are implemented. Administrator-only access is not enforced.</div><nav aria-label="Settings sections" className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"><div className="flex w-max min-w-full gap-1">{sections.map((item) => <button key={item} type="button" aria-pressed={section === item} onClick={() => setSection(item)} className={`min-h-11 whitespace-nowrap rounded-lg px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${section === item ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{item}</button>)}</div></nav><section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="text-xl font-bold">{section}</h2>{section === "Clinic Information" ? <ClinicPreview /> : <><p className="mt-1 text-sm leading-6 text-slate-600">{section === "Appointment Preferences" ? "Proposed settings only; no scheduling restrictions are applied." : section === "Notifications" ? "Notifications and providers are unavailable; no messages are sent." : section === "Security & Access" ? "These security features are not yet configured by this preview." : section === "Backup & Recovery" ? "Backup status is unavailable; no backup or recovery operations can run here." : "Future configuration requires an authorized service; existing values and workflows are unchanged."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items[section].map((item) => <div key={item} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-semibold text-slate-800">{item}</h3><p className="mt-2 text-sm text-slate-500">Unavailable</p></div>)}</div><div className="mt-5 flex flex-wrap gap-3">{(section === "Backup & Recovery" ? ["Backup Now", "Restore"] : section === "Appointment Preferences" ? ["Save Preferences"] : section === "Notifications" ? ["Save Notifications"] : section === "Categories & Statuses" ? ["Edit Categories"] : []).map((label) => <button key={label} type="button" disabled className={disabledButton}>{label}</button>)}</div><p className="mt-3 text-xs text-slate-500">Changes require secure administrative services and authorization.</p></>}</section></div></main>;
}
