// Reporting preview types; not approved service response contracts.
export type ReportCategory = "Patients" | "Registrations" | "Appointments" | "Clinical Records" | "Financial" | "Follow-ups & Tasks" | "Activity";
export type ReportingPeriod = "Today" | "This Week" | "This Month" | "This Year" | "Custom Range";
export interface ReportMetric { label: string; value?: number; available: boolean }
export interface PatientStatusSummary { status: string; count?: number; percentage?: number }
export interface ReportTableColumn { key: string; label: string }
export interface ReportFilterState { period: ReportingPeriod; startDate: string; endDate: string }
