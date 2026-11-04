// Frontend design types only; these are not approved backend contracts.
export type InvoiceStatus = "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
export interface InvoiceLineItem { description: string; quantity: number; unitPriceCentavos: number }
export interface BillingInvoice { id: string; patient: string; invoiceDate: string; dueDate: string; items: InvoiceLineItem[]; total: string; paid: string; balance: string; status: InvoiceStatus }
export interface BillingPayment { id: string; invoice: string; patient: string; date: string; amount: string; method: string; status: string }
export interface PatientBalance { id: string; patient: string; invoice: string; original: string; paid: string; remaining: string; dueDate: string; aging: string }
export interface FinancialTransaction { id: string; date: string; invoice: string; patient: string; type: string; amount: string; status: string; recordedBy: string }
