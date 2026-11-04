// UI design types only; these are not approved Identity API contracts.
export type StaffRole = "Administrator" | "Staff" | "Viewer";
export type UserAccountStatus = "Active" | "Inactive";
export interface StaffUser { id: string; username: string; displayName: string; email?: string; roles: StaffRole[]; status: UserAccountStatus; createdDate?: string; updatedDate?: string; lastLogin?: string }
export type PermissionModule = "Dashboard" | "Patient Management" | "Registration Review" | "Appointments" | "Clinical Records" | "Billing" | "Follow-ups" | "Documents" | "Reports" | "User Management" | "Audit Logs" | "Settings";
export type PermissionAction = "View" | "Create" | "Edit" | "Delete" | "Approve" | "Export" | "Administer";
export interface ProposedPermissionEntry { module: PermissionModule; action: PermissionAction; state: "Not yet configured" }
