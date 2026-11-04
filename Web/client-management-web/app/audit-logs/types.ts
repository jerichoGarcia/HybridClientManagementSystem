// Frontend design types, not approved audit API contracts.
export type AuditEventCategory = "User Actions" | "Record Changes" | "Security Events";
export type AuditAction = string;
export type AuditOutcome = "Success" | "Failure" | "Unknown";
export interface AuditEvent { id: string; timestamp: string; category: AuditEventCategory; action: AuditAction; actor?: string; targetEntity?: string; targetReference?: string; outcome: AuditOutcome; summary: string; correlationId?: string }
export interface AuditFilterState { search: string; category: string; action: string; from: string; to: string; outcome: string }
