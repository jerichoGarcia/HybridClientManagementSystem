import type { StaffUser } from "./types";

export default function UserDetails({ user }: { user: StaffUser }) {
  const fields: [string, string | undefined][] = [["User ID", user.id], ["Username", user.username], ["Display Name", user.displayName], ["Email", user.email], ["Assigned Roles", user.roles.join(", ")], ["Status", user.status], ["Created Date", user.createdDate], ["Updated Date", user.updatedDate], ["Last Login", user.lastLogin]];
  return <section aria-label="User details" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm sm:p-6"><h2 className="text-xl font-bold">User Details</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm font-semibold text-slate-600">{label}</dt><dd className="mt-1 break-words text-sm leading-6">{value?.trim() || "Not available"}</dd></div>)}</dl></section>;
}
