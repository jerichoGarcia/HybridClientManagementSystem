"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: "▣",
  },
  {
    name: "Clients",
    href: "/Clients",
    icon: "♙",
  },
  {
    name: "Contacts",
    href: "/Contacts",
    icon: "☎",
  },
  {
    name: "Addresses",
    href: "/Addresses",
    icon: "⌂",
  },
  {
    name: "Documents",
    href: "/Documents",
    icon: "▤",
  },
  {
    name: "Reports",
    href: "/Reports",
    icon: "▥",
  },
  {
    name: "Settings",
    href: "/Settings",
    icon: "⚙",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* LOGO / SYSTEM NAME */}
      <div className="flex h-20 items-center border-b border-slate-700 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold">
          CM
        </div>

        <div className="ml-3">
          <h1 className="text-sm font-bold leading-tight">
            Client Management
          </h1>

          <p className="text-xs text-slate-400">
            System
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex w-8 items-center justify-center text-base">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* USER AREA */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800 p-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold">
            AU
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              Admin User
            </p>

            <p className="truncate text-xs text-slate-400">
              Administrator
            </p>
          </div>

        </div>
      </div>
    </aside>
  );
}
