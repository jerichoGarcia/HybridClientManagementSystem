"use client";

import { useEffect, useRef, useState } from "react";
import type { BillingInvoice, BillingPayment, PatientBalance, FinancialTransaction } from "./types";

type Section = "Invoices" | "Payments" | "Balances" | "Transactions";
type Row = { id: string; date: string; search: string; status: string; cells: string[] };
const invoices: BillingInvoice[] = [];
const payments: BillingPayment[] = [];
const balances: PatientBalance[] = [];
const transactions: FinancialTransaction[] = [];
const sections: Section[] = ["Invoices", "Payments", "Balances", "Transactions"];
const headers: Record<Section, string[]> = {
  Invoices: ["Invoice Number", "Patient", "Invoice Date", "Due Date", "Total Amount", "Amount Paid", "Balance", "Invoice Status", "Actions"],
  Payments: ["Payment Reference", "Invoice Reference", "Patient", "Payment Date", "Amount", "Payment Method", "Payment Status"],
  Balances: ["Patient", "Invoice Number", "Original Amount", "Paid Amount", "Remaining Balance", "Due Date", "Aging / Overdue Indicator"],
  Transactions: ["Transaction ID", "Date", "Related Invoice", "Patient", "Type", "Amount", "Status", "Recorded By"],
};
const rows: Record<Section, Row[]> = {
  Invoices: invoices.map((r) => ({ id: r.id, date: r.invoiceDate, search: `${r.id} ${r.patient}`, status: r.status, cells: [r.id, r.patient, r.invoiceDate, r.dueDate, r.total, r.paid, r.balance, r.status, "Unavailable"] })),
  Payments: payments.map((r) => ({ id: r.id, date: r.date, search: `${r.id} ${r.invoice} ${r.patient}`, status: r.status, cells: [r.id, r.invoice, r.patient, r.date, r.amount, r.method, r.status] })),
  Balances: balances.map((r) => ({ id: r.id, date: r.dueDate, search: `${r.patient} ${r.invoice}`, status: r.aging, cells: [r.patient, r.invoice, r.original, r.paid, r.remaining, r.dueDate, r.aging] })),
  Transactions: transactions.map((r) => ({ id: r.id, date: r.date, search: `${r.id} ${r.invoice} ${r.patient}`, status: r.status, cells: [r.id, r.date, r.invoice, r.patient, r.type, r.amount, r.status, r.recordedBy] })),
};
const control = "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-100 disabled:text-slate-600";
const secondary = "min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
const panel = "rounded-2xl border border-slate-200 bg-white shadow-sm";

// Limit values to keep all intermediate centavo calculations safely within integer precision.
function centavos(value: string): number | null {
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
function peso(value: number) { return `₱${Math.floor(value / 100).toLocaleString("en-PH")}.${String(value % 100).padStart(2, "0")}`; }

function PreviewDialog({ kind, close }: { kind: "Invoice" | "Payment"; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { if (dialog?.open) dialog.close(); }; }, []);
  const update = (key: string, value: string) => { setValues((v) => ({ ...v, [key]: value })); setErrors((e) => ({ ...e, [key]: "" })); setChecked(false); };
  const quantity = /^[1-9]\d{0,3}$/.test(values.quantity || "") ? Number(values.quantity) : null;
  const price = centavos(values.price || "");
  const discount = values.discount ? centavos(values.discount) : 0;
  const total = quantity !== null && price !== null && discount !== null && discount <= quantity * price ? quantity * price - discount : null;
  function check() {
    const next: Record<string, string> = {};
    if (kind === "Invoice") {
      if (!values.invoiceDate) next.invoiceDate = "Enter an invoice date.";
      if (!values.dueDate) next.dueDate = "Enter a due date.";
      else if (values.invoiceDate && values.dueDate < values.invoiceDate) next.dueDate = "Due date must be on or after the invoice date.";
      if (!values.description?.trim()) next.description = "Enter a line item description.";
      if (quantity === null) next.quantity = "Enter a whole quantity from 1 to 9999.";
      if (price === null) next.price = "Enter a nonnegative price with up to two decimal places.";
      if (discount === null || (quantity !== null && price !== null && discount > quantity * price)) next.discount = "Enter a valid discount no greater than the line item total.";
    } else {
      if (!values.invoice?.trim()) next.invoice = "Enter an invoice reference for the preview.";
      if (!values.date) next.date = "Enter a payment date.";
      if (centavos(values.amount || "") === null || centavos(values.amount || "") === 0) next.amount = "Enter a positive amount with up to two decimal places.";
      if (!values.method) next.method = "Select a payment method.";
    }
    setErrors(next); setChecked(Object.keys(next).length === 0);
  }
  const field = (key: string, label: string, type = "text", options?: string[]) => <div className={key === "notes" ? "sm:col-span-2" : "min-w-0"} key={key}><label htmlFor={`billing-preview-${key}`} className="text-sm font-semibold text-slate-700">{label}</label>{options ? <select id={`billing-preview-${key}`} value={values[key] || ""} onChange={(e) => update(key, e.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `billing-error-${key}` : undefined} className={`mt-2 ${control}`}><option value="">Select a method</option>{options.map((o) => <option key={o}>{o}</option>)}</select> : <input id={`billing-preview-${key}`} type={type} inputMode={type === "text" && ["price", "discount", "amount"].includes(key) ? "decimal" : undefined} value={values[key] || ""} onChange={(e) => update(key, e.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `billing-error-${key}` : undefined} className={`mt-2 ${control}`} />}{errors[key] && <p id={`billing-error-${key}`} className="mt-1 text-sm text-red-700">{errors[key]}</p>}</div>;
  return <dialog ref={ref} onCancel={(event) => { event.preventDefault(); close(); }} aria-labelledby="billing-dialog-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"><div className="p-5 sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Frontend preview</p><h2 id="billing-dialog-title" className="mt-1 text-2xl font-bold">{kind} Form Preview</h2></div><button type="button" onClick={close} aria-label="Close billing form preview" className={`${secondary} px-3`}>×</button></div><p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">Use fictional values only. Nothing entered is saved or sent. Do not enter card numbers or account credentials.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{kind === "Invoice" ? <><div><label htmlFor="billing-patient" className="text-sm font-semibold text-slate-700">Patient</label><select id="billing-patient" disabled className={`mt-2 ${control}`}><option>Unavailable until secure integration</option></select></div>{field("invoiceDate", "Invoice Date *", "date")}{field("dueDate", "Due Date *", "date")}<h3 className="font-bold sm:col-span-2">Line Item</h3>{field("description", "Description / Procedure *")}{field("quantity", "Quantity *")}{field("price", "Unit Price (PHP) *")}{field("discount", "Discount (PHP, optional)")}{field("notes", "Notes (optional)")}</> : <>{field("invoice", "Invoice reference *")}{field("amount", "Payment amount (PHP) *")}{field("date", "Payment date *", "date")}{field("method", "Payment method *", "text", ["Cash", "Card", "Bank Transfer", "E-wallet", "Other"])}{field("notes", "Notes (optional)")}</>}</div>{kind === "Invoice" && <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold">Temporary preview total: {total === null ? "Enter valid quantity and amounts" : peso(total)}<span className="mt-1 block font-normal text-slate-600">One line item, less the entered discount; no tax or accounting rules applied.</span></p>}<p aria-live="polite" className="mt-4 text-sm text-slate-600">{checked ? "Preview fields checked. Saving remains unavailable." : Object.values(errors).some(Boolean) ? "Please correct the highlighted fields." : "Preview entries are discarded when this dialog closes."}</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={check} className={secondary}>Check preview fields</button><button type="button" disabled className="min-h-11 cursor-not-allowed rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-600">{kind === "Invoice" ? "Create Invoice" : "Record Payment"}</button></div><p className="mt-2 text-right text-xs text-slate-500">Secure billing services and authorization are required before this action can be enabled.</p></div></dialog>;
}

export default function TransactionsPage() {
  const [section, setSection] = useState<Section>("Invoices");
  const [dialog, setDialog] = useState<"Invoice" | "Payment" | null>(null);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const visible = rows[section].filter((row) => (!search.trim() || row.search.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())) && (!date || row.date === date) && (!status.trim() || row.status.toLocaleLowerCase().includes(status.trim().toLocaleLowerCase())));
  return <main className="min-h-screen min-w-0 bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl space-y-7"><header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Clinic operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Transactions &amp; Billing</h1><p className="mt-2 text-sm leading-6 text-slate-600">Manage patient invoices, payments, balances, and financial transactions.</p></header><div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Development preview.</strong> Billing is currently a frontend preview. Invoices, payments, and financial records cannot be saved or processed until secure billing services and authorization are implemented.</div><section aria-label="Billing summary" className="grid gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">{["Total Billed", "Payments Received", "Outstanding Balance", "Overdue Invoices"].map((item) => <div key={item} className={`${panel} p-5`}><p className="text-sm font-semibold text-slate-700">{item}</p><p aria-label={`${item}: unavailable`} className="mt-3 text-3xl font-bold text-slate-700">—</p><p className="mt-2 text-xs text-slate-500">Awaiting billing service.</p></div>)}</section><nav aria-label="Billing sections" className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"><div className="flex w-max min-w-full gap-1">{sections.map((item) => <button key={item} type="button" aria-pressed={section === item} onClick={() => setSection(item)} className={`min-h-11 whitespace-nowrap rounded-lg px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${section === item ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{item}</button>)}</div></nav><section className={`${panel} min-w-0 p-4 sm:p-6`}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{section}</h2><p className="mt-1 text-sm leading-6 text-slate-600">Preview only · Filters operate locally; the billing service is not connected.</p></div>{(section === "Invoices" || section === "Payments") && <button type="button" onClick={() => setDialog(section === "Invoices" ? "Invoice" : "Payment")} className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Preview {section === "Invoices" ? "Invoice" : "Payment"} Form</button>}</div><div className="mt-5 grid gap-4 md:grid-cols-3"><div><label htmlFor="billing-search" className="text-sm font-semibold text-slate-700">Search patient or reference</label><input id="billing-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} className={`mt-2 ${control}`} /></div><div><label htmlFor="billing-date" className="text-sm font-semibold text-slate-700">{section === "Balances" ? "Due date" : "Record date"}</label><input id="billing-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-2 ${control}`} /></div><div><label htmlFor="billing-status" className="text-sm font-semibold text-slate-700">{section === "Balances" ? "Aging search" : "Status search"}</label><input id="billing-status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Filter locally" className={`mt-2 ${control}`} /></div></div><button type="button" onClick={() => { setSearch(""); setDate(""); setStatus(""); }} className={`mt-4 ${secondary}`}>Clear filters</button><div className="mt-5 overflow-x-auto rounded-xl border border-slate-200" role="region" aria-label={`${section} table, scroll horizontally`} tabIndex={0}><table className="w-full min-w-[900px] text-left text-sm"><caption className="sr-only">{section} list</caption><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600"><tr>{headers[section].map((heading) => <th key={heading} scope="col" className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>{visible.map((row) => <tr key={row.id} className="border-t border-slate-100">{row.cells.map((cell, index) => <td key={`${row.id}-${index}`} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody></table></div>{visible.length === 0 && <div role="status" className="py-10 text-center"><p className="font-semibold text-slate-800">{rows[section].length ? "No records match these filters." : `No ${section.toLowerCase()} available.`}</p><p className="mt-2 text-sm text-slate-500">{rows[section].length ? "Try different filters." : "Billing records will appear when the service is available."}</p></div>}</section>{dialog && <PreviewDialog kind={dialog} close={() => setDialog(null)} />}</div></main>;
}
