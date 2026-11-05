
"use client";

import { patientFetch, patientError } from "../lib/apiConfig";

import PatientDialog from "../components/PatientDialog";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ClientStatus {
  id: number;
  name: string;
  description?: string;
}

interface Client {
  id: number;
  clientNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  statusId: number;
  status?: ClientStatus | null;
  dateCreated: string;
}

interface ClientForm {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

const API_URL = "/api/Clients";

export default function ClientsPage() {

  const router = useRouter();

  // --------------------------------------------------
  // CLIENT DATA
  // --------------------------------------------------

  const [clients, setClients] = useState<Client[]>([]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // PAGE STATE
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // ADD CLIENT MODAL
  // --------------------------------------------------

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("add") === "1") {
      const timer = window.setTimeout(() => {
        setShowAddForm(true);
        url.searchParams.delete("add");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  // --------------------------------------------------
  // ADD CLIENT FORM
  // --------------------------------------------------

  const [form, setForm] = useState<ClientForm>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  // --------------------------------------------------
  // LOAD CLIENTS
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchClients = async () => {
      try {
        const response = await patientFetch(API_URL);



        const data: Client[] = await response.json();

        if (!cancelled) {
          setClients(data);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(patientError(err, "loading patients"));
          setLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // SEARCH FILTER
  // --------------------------------------------------

  const filteredClients = clients.filter((client) => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return true;
    }

    const fullName =
      `${client.firstName} ${client.middleName ?? ""} ${client.lastName}`
        .toLowerCase();

    const clientNumber =
      client.clientNumber?.toLowerCase() ?? "";

    const email =
      client.email?.toLowerCase() ?? "";

    const phone =
      client.phoneNumber?.toLowerCase() ?? "";

    return (
      clientNumber.includes(searchTerm) ||
      fullName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      phone.includes(searchTerm)
    );
  });

  // --------------------------------------------------
  // FORM INPUT CHANGE
  // --------------------------------------------------

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      phoneNumber: "",
      address: "",
    });
  };

  // --------------------------------------------------
  // CLOSE ADD CLIENT FORM
  // --------------------------------------------------

  const closeAddForm = () => {
    if (saving) {
      return;
    }

    setShowAddForm(false);
    resetForm();
  };

  // --------------------------------------------------
  // ADD CLIENT
  // --------------------------------------------------

  const handleAddClient = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.firstName.trim()) {
      alert("First Name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      alert("Last Name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await patientFetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          middleName: form.middleName.trim() || null,
          email: form.email.trim() || null,
          phoneNumber: form.phoneNumber.trim() || null,
          address: form.address.trim() || null,
        }),
      });



      const newClient: Client = await response.json();

      // Add newly-created client to the table immediately.
      setClients((previous) => [
        ...previous,
        newClient,
      ]);

      resetForm();
      setShowAddForm(false);

      alert("Patient added successfully.");
    } catch (err) {
      alert(patientError(err, "adding patient"));
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // STATUS DISPLAY
  // --------------------------------------------------

  const getStatusName = (client: Client) => {
    if (client.status?.name) {
      return client.status.name;
    }

    if (client.statusId === 1) {
      return "Active";
    }

    if (client.statusId === 2) {
      return "Inactive";
    }

    if (client.statusId === 3) {
      return "Pending";
    }

    if (client.statusId === 4) {
      return "Archived";
    }

    return "Unknown";
  };

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------

  const getStatusClass = (client: Client) => {
    const status = getStatusName(client).toLowerCase();

    if (status === "active") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "inactive") {
      return "bg-slate-100 text-slate-700";
    }

    if (status === "pending") {
      return "bg-amber-50 text-amber-800";
    }

    if (status === "archived") {
      return "bg-violet-50 text-violet-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="patient-ui min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Patient care</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Patient Management
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Manage your patients and their information.
            </p>
          </div>

          <button
            type="button"
            data-patient-dialog-fallback
            onClick={() => setShowAddForm(true)}
            className="patient-primary w-full px-5 py-2.5 transition sm:w-auto"
          >
            + Add Patient
          </button>
        </div>

        {/* SEARCH */}
        <div className="patient-panel mb-6 p-4 sm:p-5">
          <label
            htmlFor="client-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search Patients
          </label>

          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            >
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              id="client-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by patient number, name, email, or phone..."
              className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-11 pr-12 text-base text-slate-900 placeholder:text-slate-500 outline-none transition"
            />

            {search && (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setSearch("")}
                aria-label="Clear patient search"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-medium">
              Connection Error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div role="status" className="patient-panel p-10 text-center">
            <p className="text-gray-500">
              Loading patients...
            </p>
          </div>
        )}

        {/* CLIENT TABLE */}
        {!loading && !error && (
          <div className="patient-panel overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[720px] text-sm">

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Patient Number
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">

                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {client.clientNumber || "-"}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {client.firstName}{" "}
                        {client.middleName
                          ? `${client.middleName} `
                          : ""}
                        {client.lastName}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {client.email || "-"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {client.phoneNumber || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                            client
                          )}`}
                        >
                          {getStatusName(client)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => { router.push(`/Clients/${client.id}`); }}
                          className="font-semibold text-blue-700 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {/* NO RESULTS */}
            {filteredClients.length === 0 && (
              <div className="p-10 text-center">

                <p className="font-medium text-gray-700">
                  No patients found
                </p>

                {search && (
                  <p className="mt-1 text-sm text-gray-500">
                    No results for &quot;{search}&quot;.
                  </p>
                )}

              </div>
            )}

            {/* TABLE FOOTER */}
            {filteredClients.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium text-gray-700">
                    {filteredClients.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700">
                    {clients.length}
                  </span>{" "}
                  patients
                </p>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ==================================================
          ADD CLIENT MODAL
          ================================================== */}

      {showAddForm && (
        <PatientDialog titleId="add-patient-title" onClose={closeAddForm} busy={saving}>

          <div className="w-full max-w-2xl p-5 sm:p-7">

            {/* MODAL HEADER */}
            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 id="add-patient-title" className="text-2xl font-bold text-gray-900">
                  Add Patient
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the patient&apos;s information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddForm}
                disabled={saving}
                aria-label="Close add patient form"
                className="text-2xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <form onSubmit={handleAddClient}>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* FIRST NAME */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    First Name *
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Juan"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                {/* LAST NAME */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Last Name *
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Dela Cruz"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                {/* MIDDLE NAME */}
                <div>
                  <label
                    htmlFor="middleName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Middle Name
                  </label>

                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={form.middleName}
                    onChange={handleChange}
                    placeholder="Santos"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="09171234567"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                {/* ADDRESS */}
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Quezon City, Philippines"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

              </div>

              {/* FORM BUTTONS */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={saving}
                  className="patient-secondary px-5 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="patient-primary px-5 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Patient"}
                </button>

              </div>

            </form>

          </div>

        </PatientDialog>
      )}
    </main>
  );
}

