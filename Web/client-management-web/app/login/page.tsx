"use client";

import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      nextErrors.username = "Enter your username.";
    } else if (username !== username.trim()) {
      nextErrors.username = "Remove spaces from the beginning or end of your username.";
    }
    if (!password) nextErrors.password = "Enter your password.";

    setErrors(nextErrors);
    setNotice(Object.keys(nextErrors).length === 0 ? "Authentication is not configured yet." : "");
  }

  const inputClass = "mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3">
          <div aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">CM</div>
          <p className="text-sm font-semibold leading-tight text-slate-900">Client Management<br /><span className="font-normal text-slate-500">System</span></p>
        </div>

        <section aria-labelledby="login-title" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
          <h1 id="login-title" className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to Client Management System.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">Username</label>
              <input id="username" name="username" type="text" autoComplete="username" value={username} onChange={(event) => { setUsername(event.target.value); setErrors((previous) => ({ ...previous, username: undefined })); setNotice(""); }} placeholder="Enter your username" aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? "username-error" : undefined} className={inputClass} />
              {errors.username && <p id="username-error" role="alert" className="mt-2 text-sm text-red-700">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setErrors((previous) => ({ ...previous, password: undefined })); setNotice(""); }} placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className={`${inputClass} pr-20`} />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-controls="password" aria-pressed={showPassword} className="absolute bottom-1 right-1 h-10 rounded-md px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{showPassword ? "Hide" : "Show"}</button>
              </div>
              {errors.password && <p id="password-error" role="alert" className="mt-2 text-sm text-red-700">{errors.password}</p>}
            </div>

            <div aria-live="polite" aria-atomic="true">{notice && <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">{notice}</p>}</div>
            <button type="submit" className="h-12 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Sign In</button>
          </form>
        </section>
        <p className="mt-6 text-center text-xs text-slate-500">Client Management System</p>
      </div>
    </main>
  );
}
