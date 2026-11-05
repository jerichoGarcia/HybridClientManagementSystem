"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ClinicIcon from "./ClinicIcon";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "▣" },
  { name: "Patients", href: "/Clients", icon: "♙" },
  { name: "Registration Review", href: "/registrations", icon: "▤" },
  { name: "Appointments", href: "/appointments", icon: "▦" },
  { name: "Clinical Records", href: "/records", icon: "✚" },
  { name: "Transactions & Billing", href: "/transactions", icon: "▤" },
  { name: "Follow-ups & Tasks", href: "/follow-ups", icon: "☑" },
  { name: "Documents", href: "/documents", icon: "▤" },
  { name: "Reports", href: "/reports", icon: "▥" },
  { name: "User Management", href: "/users", icon: "♙" },
  { name: "Audit Logs", href: "/audit-logs", icon: "≡" },
  { name: "Settings", href: "/settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="app-sidebar z-40 flex w-full flex-col text-white md:fixed md:inset-y-0 md:left-0 md:w-64">
      <div className="sidebar-divider flex items-center gap-3 border-b px-5 py-4">
        <ClinicIcon />
        <p className="text-sm font-bold leading-snug">Dental Clinic<br />Management System</p>
      </div>
      <nav aria-label="Main navigation" className="overflow-x-auto px-3 py-3 md:flex-1 md:overflow-y-auto md:overflow-x-hidden">
        <div className="flex w-max gap-1 md:w-auto md:flex-col">
          {menuItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`));
            const content = <><span aria-hidden="true" className="flex w-6 shrink-0 justify-center text-base">{item.icon}</span><span className="min-w-0 flex-1">{item.name}</span>{!item.href && <span className="text-[10px] font-medium text-slate-400">Coming Soon</span>}</>;
            const classes = "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";
            return item.href ? (
              <Link key={item.name} href={item.href} aria-current={isActive ? "page" : undefined} className={`${classes} ${isActive ? "sidebar-active" : "text-slate-200 hover:bg-white/10 hover:text-white"}`}>{content}</Link>
            ) : (
              <div key={item.name} aria-disabled="true" className={`${classes} cursor-not-allowed text-slate-400`}>{content}</div>
            );
          })}
        </div>
      </nav>
      <div className="sidebar-divider border-t px-3 py-3">
        <button type="button" disabled aria-describedby="logout-unavailable" className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-400">
          <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center text-base"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M10 17v2H5V5h5v2M14 8l4 4-4 4M8 12h10" /></svg></span>
          <span className="min-w-0 flex-1">Log out</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        </button>
        <span id="logout-unavailable" className="sr-only">Unavailable until authentication is implemented.</span>
      </div>
    </aside>
  );
}
