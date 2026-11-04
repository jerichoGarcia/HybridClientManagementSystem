// Future UI models only; not backend configuration contracts.
export type SettingsSection = "Clinic Information" | "Appointment Preferences" | "Categories & Statuses" | "Notifications" | "Security & Access" | "Backup & Recovery";
export interface ClinicSettings { name?: string; phone?: string; email?: string; address?: string; operatingHours?: string; website?: string }
export interface AppointmentPreferences { durationMinutes?: number; startTime?: string; endTime?: string; workingDays?: string[]; leadTime?: string; cancellationWindow?: string }
export interface NotificationPreferences { appointmentReminders?: boolean; followUps?: boolean; staffTasks?: boolean; email?: boolean; sms?: boolean }
export interface SecuritySettingsSummary { passwordPolicy?: string; login?: string; session?: string; lockout?: string; permissions?: string; auditRetention?: string }
export interface BackupStatusSummary { status?: string; lastSuccessful?: string; frequency?: string; retention?: string; recovery?: string }
