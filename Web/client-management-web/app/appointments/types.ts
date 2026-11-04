// Proposed UI types only; not an approved backend contract.
export type AppointmentStatus = "Scheduled" | "Confirmed" | "Checked In" | "Completed" | "Cancelled" | "No Show";
export type Appointment = { id: string; patient: string; date: string; time: string; durationMinutes: number; visitReason: string; provider: string; status: AppointmentStatus; notes?: string };
