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
  { name: "Audit Logs", icon: "≡" },
  { name: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="z-40 flex w-full flex-col bg-slate-900 text-white md:fixed md:inset-y-0 md:left-0 md:w-64">
      <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-4">
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
              <Link key={item.name} href={item.href} aria-current={isActive ? "page" : undefined} className={`${classes} ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>{content}</Link>
            ) : (
              <div key={item.name} aria-disabled="true" className={`${classes} cursor-not-allowed text-slate-400`}>{content}</div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
