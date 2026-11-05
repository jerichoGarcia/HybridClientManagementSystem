"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { apiFetch, PatientApiError } from "../lib/apiConfig";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);

  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname.startsWith("/register/");
  useEffect(() => {
    if (isPublicRoute) return;
    let active = true;
    apiFetch("/api/auth/session")
      .then(() => { if (active) setAuthorizedPath(pathname); })
      .catch((error) => {
        if (active && error instanceof PatientApiError && (error.status === 401 || error.status === 403)) router.replace("/login");
        else if (active) setAuthorizedPath(pathname);
      });
    return () => { active = false; };
  }, [isPublicRoute, pathname, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (authorizedPath !== pathname) return <main className="min-h-screen bg-slate-50" aria-busy="true" />;

  return (
    <>
      <Sidebar />
      <div className="min-h-screen md:pl-64">{children}</div>
    </>
  );
}
