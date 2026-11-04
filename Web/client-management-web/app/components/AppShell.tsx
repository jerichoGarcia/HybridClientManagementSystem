"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/register/")) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen md:pl-64">{children}</div>
    </>
  );
}
