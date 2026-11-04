// Preview types only; backend contracts have not been approved.
export type TaskPriority = "Low" | "Normal" | "High" | "Urgent";
export type TaskStatus = "Open" | "In Progress" | "Completed" | "Cancelled";
export type FollowUpStatus = "Open" | "In Progress" | "Completed" | "Cancelled";
export type FollowUpType = "Post-extraction follow-up" | "Post-treatment checkup" | "Routine recall" | "Patient callback" | "Treatment plan discussion" | "Other";

export interface ClinicTask {
  id: string; title: string; priority: TaskPriority; status: TaskStatus;
  description?: string; patient?: string; staff?: string;
  /** Philippine calendar date (YYYY-MM-DD) and wall-clock time (HH:mm). */
  dueDate?: string; dueTime?: string;
  /** Offset-qualified ISO timestamps, pending an approved backend contract. */
  createdAt?: string; updatedAt?: string;
}
export interface PatientFollowUp {
  id: string; patient?: string; type: FollowUpType; date: string; time?: string;
  staff?: string; status: FollowUpStatus; notes?: string; related?: string;
}
