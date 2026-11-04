"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import ClinicIcon from "../../components/ClinicIcon";
import { registrationUrl } from "./registrationUrl";

export default function RegistrationQrPage() {
  const url = registrationUrl(process.env.NEXT_PUBLIC_REGISTRATION_BASE_URL);
  return (
    <main className="qr-page min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-xl">
        <div className="qr-controls mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/register" className="text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">← Back to registration</Link>
          {url && <button type="button" onClick={() => window.print()} className="min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Print QR Code</button>}
        </div>
        <article className="qr-poster rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="flex justify-center"><ClinicIcon /></div>
          <p className="mt-4 text-sm font-semibold text-slate-600">Dental Clinic Management System</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Patient Registration</h1>
          {url ? <>
            <p className="mt-3 text-sm leading-6 text-slate-600">Scan with your phone to open the registration preview.</p>
            <div className="qr-code mx-auto mt-6 w-fit max-w-full rounded-xl border border-slate-200 bg-white p-3">
              <QRCodeSVG value={url} size={288} level="M" marginSize={4} role="img" aria-label={`QR code for the patient registration page: ${url}`} className="h-auto max-w-full" />
            </div>
            <p className="mt-4 break-all text-sm text-slate-700">{url}</p>
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-950">Development preview: online registration submission is not yet available. Do not enter real personal information.</p>
          </> : <div role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-left text-sm leading-6 text-amber-950"><p className="font-semibold">Registration URL not configured</p><p className="mt-2">Set NEXT_PUBLIC_REGISTRATION_BASE_URL to the clinic’s public HTTPS origin, or a reachable private LAN address such as http://192.168.x.x:3000 for local testing. Restart the development server; production builds must be rebuilt after changing this value.</p><p className="mt-2">Localhost, loopback addresses, credentials, and unrelated paths are not accepted. Online registration submission is not yet available.</p></div>}
        </article>
      </div>
    </main>
  );
}
