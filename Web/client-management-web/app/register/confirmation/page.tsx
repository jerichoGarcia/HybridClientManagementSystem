import Link from "next/link";
import ClinicIcon from "../../components/ClinicIcon";

export default function RegistrationConfirmationPage() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><ClinicIcon /><p className="mt-5 text-sm font-semibold text-blue-700">Dental Clinic Management System</p><h1 className="mt-2 text-2xl font-bold">Registration submission unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-600">Online registration is not enabled yet. No registration has been submitted or received through this preview.</p><Link href="/register" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Return to registration</Link></section></main>;
}
