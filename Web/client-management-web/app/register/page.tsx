"use client";

import { useState } from "react";
import Link from "next/link";
import ClinicIcon from "../components/ClinicIcon";
import { getCityOptions, METRO_MANILA, PHILIPPINE_PROVINCE_OPTIONS } from "../lib/philippineLocations";

type Registration = { firstName: string; middleName: string; lastName: string; dateOfBirth: string; mobile: string; alternativePhone: string; email: string; province: string; city: string; barangay: string; street: string; postalCode: string };
type Field = keyof Registration;
type Errors = Partial<Record<Field, string>>;
const initial: Registration = { firstName: "", middleName: "", lastName: "", dateOfBirth: "", mobile: "", alternativePhone: "", email: "", province: "", city: "", barangay: "", street: "", postalCode: "" };
const steps = ["Personal", "Contact", "Address", "Review"];
const control = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-100 disabled:text-slate-500";

function validate(form: Registration, step: number): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!form.firstName.trim()) errors.firstName = "Enter your first name.";
    if (!form.lastName.trim()) errors.lastName = "Enter your last name.";
    if (form.dateOfBirth) {
      const date = new Date(`${form.dateOfBirth}T00:00:00`);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (Number.isNaN(date.getTime()) || date > today || date.getFullYear() < 1900) errors.dateOfBirth = "Enter a valid date of birth that is not in the future.";
    }
  }
  if (step === 1) {
    const phone = (value: string) => /^[+\d\s()-]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15;
    if (!form.mobile.trim()) errors.mobile = "Enter your mobile number.";
    else if (!phone(form.mobile.trim())) errors.mobile = "Enter a valid phone number with 7 to 15 digits.";
    if (form.alternativePhone.trim() && !phone(form.alternativePhone.trim())) errors.alternativePhone = "Enter a valid phone number with 7 to 15 digits.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
  }
  if (step === 2) {
    if (!PHILIPPINE_PROVINCE_OPTIONS.includes(form.province)) errors.province = "Select your province or region.";
    if (!getCityOptions(form.province).includes(form.city)) errors.city = "Select a city or municipality in your province or region.";
    if (!form.street.trim()) errors.street = "Enter your street or house number.";
    if (form.postalCode.trim() && !/^\d{4}$/.test(form.postalCode.trim())) errors.postalCode = "Enter a 4-digit Philippine postal code.";
  }
  return errors;
}

function FieldLabel({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return <div className="min-w-0"><label htmlFor={id} className="block text-sm font-semibold text-slate-700">{label}</label>{children}{error && <p id={`${id}-error`} className="mt-2 text-sm text-red-700">{error}</p>}</div>;
}

export default function RegistrationPage() {
  const [form, setForm] = useState<Registration>(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [started, setStarted] = useState(false);
  const update = (field: Field, value: string) => { setForm((previous) => ({ ...previous, [field]: value, ...(field === "province" ? { city: "" } : {}) })); setErrors((previous) => ({ ...previous, [field]: undefined, ...(field === "province" ? { city: undefined } : {}) })); };
  const fieldProps = (field: Field) => ({ id: field, name: field, value: form[field], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => update(field, event.target.value), "aria-invalid": Boolean(errors[field]), "aria-describedby": errors[field] ? `${field}-error` : undefined, className: control });
  const next = () => { const nextErrors = validate(form, step); setErrors(nextErrors); if (!Object.keys(nextErrors).length && step < 3) setStep(step + 1); };
  const reviewRows = [["First name", form.firstName], ["Middle name", form.middleName], ["Last name", form.lastName], ["Date of birth (prototype only)", form.dateOfBirth], ["Mobile number", form.mobile], ["Alternative phone", form.alternativePhone], ["Email", form.email], ["Country", "Philippines"], ["Province / region", form.province], ["City / municipality", form.city], ["Barangay (prototype only)", form.barangay], ["Street / house number", form.street], ["Postal code", form.postalCode]];
  return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6"><ClinicIcon /><p className="text-sm font-bold leading-snug">Dental Clinic<br />Management System</p></div></header><div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12"><section><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Patient portal</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">New Patient Registration</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Complete the information below to prepare your patient registration.</p></section><div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Development preview:</strong> Online submission is not available. Do not enter real personal information. Nothing entered here is saved or sent to the clinic.</div><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><h2 className="text-lg font-bold">Before you begin</h2><p className="mt-2 text-sm leading-6 text-slate-600">This preview walks through personal, contact, and address details before a review. Your entries remain only in this page’s memory and disappear when you leave or refresh.</p>{!started && <button type="button" onClick={() => setStarted(true)} className="mt-5 min-h-12 rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Start Registration</button>}</section>
  {started && <section aria-labelledby="form-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Step {step + 1} of 4</p><h2 id="form-heading" className="mt-1 text-2xl font-bold">{["Personal Information", "Contact Information", "Address Information", "Review Details"][step]}</h2></div><span className="text-sm text-slate-500">Fields marked * are required</span></div><ol aria-label="Registration progress" className="mt-6 grid grid-cols-4 gap-1 sm:gap-3">{steps.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={`min-w-0 border-t-4 pt-2 text-xs font-semibold sm:text-sm ${index <= step ? "border-blue-600 text-blue-700" : "border-slate-200 text-slate-500"}`}><span className="sm:hidden">{index + 1}. </span>{label}</li>)}</ol>
  <div className="mt-8"><div aria-live="polite" className="text-sm text-red-700">{Object.keys(errors).length > 0 && "Please correct the fields below."}</div>
  {step === 0 && <div className="grid gap-5 sm:grid-cols-2"><FieldLabel id="firstName" label="First name *" error={errors.firstName}><input {...fieldProps("firstName")} autoComplete="given-name" required /></FieldLabel><FieldLabel id="middleName" label="Middle name (optional)" error={errors.middleName}><input {...fieldProps("middleName")} autoComplete="additional-name" /></FieldLabel><FieldLabel id="lastName" label="Last name *" error={errors.lastName}><input {...fieldProps("lastName")} autoComplete="family-name" required /></FieldLabel><FieldLabel id="dateOfBirth" label="Date of birth (optional; prototype only)" error={errors.dateOfBirth}><input {...fieldProps("dateOfBirth")} type="date" autoComplete="bday" /></FieldLabel></div>}
  {step === 1 && <div className="grid gap-5 sm:grid-cols-2"><FieldLabel id="mobile" label="Mobile number *" error={errors.mobile}><input {...fieldProps("mobile")} type="tel" autoComplete="tel" inputMode="tel" placeholder="Enter mobile number" required /></FieldLabel><FieldLabel id="alternativePhone" label="Alternative phone (optional)" error={errors.alternativePhone}><input {...fieldProps("alternativePhone")} type="tel" inputMode="tel" /></FieldLabel><FieldLabel id="email" label="Email address (optional)" error={errors.email}><input {...fieldProps("email")} type="email" autoComplete="email" /></FieldLabel></div>}
  {step === 2 && <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="country" className="block text-sm font-semibold text-slate-700">Country</label><input id="country" className={control} value="Philippines" readOnly autoComplete="country-name" /></div><FieldLabel id="province" label="Province / region *" error={errors.province}><select {...fieldProps("province")} autoComplete="address-level1" required><option value="">Select province / region</option>{PHILIPPINE_PROVINCE_OPTIONS.map((province) => <option key={province} value={province}>{province === METRO_MANILA ? "Metro Manila / NCR" : province}</option>)}</select></FieldLabel><FieldLabel id="city" label="City / municipality *" error={errors.city}><select {...fieldProps("city")} autoComplete="address-level2" disabled={!form.province} required><option value="">{form.province ? "Select city / municipality" : "Select province / region first"}</option>{getCityOptions(form.province).map((city) => <option key={city} value={city}>{city}</option>)}</select></FieldLabel><FieldLabel id="barangay" label="Barangay (optional; prototype only)" error={errors.barangay}><input {...fieldProps("barangay")} /></FieldLabel><FieldLabel id="street" label="Street / house number *" error={errors.street}><input {...fieldProps("street")} autoComplete="address-line1" required /></FieldLabel><FieldLabel id="postalCode" label="Postal code (optional)" error={errors.postalCode}><input {...fieldProps("postalCode")} autoComplete="postal-code" inputMode="numeric" maxLength={4} /></FieldLabel></div>}
  {step === 3 && <div><p className="text-sm leading-6 text-slate-600">Check your entries below. Use Previous to make corrections. These details have not been submitted.</p><dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">{reviewRows.map(([label, value]) => <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-2 sm:gap-4"><dt className="text-sm font-medium text-slate-600">{label}</dt><dd className="break-words text-sm text-slate-900">{value.trim() || "Not provided"}</dd></div>)}</dl><div role="note" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">Registration submission will become available when the clinic’s registration service is enabled. This preview does not send or save your details.</div></div>}
  <div className="mt-8 flex flex-wrap justify-between gap-3">{step > 0 ? <button type="button" onClick={() => { setStep(step - 1); setErrors({}); }} className="min-h-12 rounded-xl border border-slate-300 px-5 font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Previous</button> : <span />}{step < 3 ? <button type="button" onClick={next} className="min-h-12 rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Next</button> : <button type="button" disabled className="min-h-12 cursor-not-allowed rounded-xl bg-slate-200 px-6 font-semibold text-slate-600">Submission unavailable</button>}</div></div></section>}
  <aside className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Need help?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Please contact the clinic directly for registration assistance. Online registration is not yet available.</p><Link href="/register/qr" className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Registration QR poster</Link></aside><footer className="pb-2 text-center text-xs text-slate-500">Dental Clinic Management System · Registration preview</footer></div></main>;
}
