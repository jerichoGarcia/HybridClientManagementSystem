
"use client";

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

const API_URL = "http://localhost:5110/api/Clients";

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
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch clients.");
        }

        const data: Client[] = await response.json();

        if (!cancelled) {
          setClients(data);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            "Unable to connect to the Client Management API."
          );
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

      const response = await fetch(API_URL, {
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

      if (!response.ok) {
        const errorMessage = await response.text();

        console.error(
          "Create client failed:",
          errorMessage
        );

        throw new Error("Failed to create client.");
      }

      const newClient: Client = await response.json();

      // Add newly-created client to the table immediately.
      setClients((previous) => [
        ...previous,
        newClient,
      ]);

      resetForm();
      setShowAddForm(false);

      alert("Client added successfully.");
    } catch (err) {
      console.error(err);
      alert(
        "Unable to add client. Please check that the API is running."
      );
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
      return "bg-green-100 text-green-700";
    }

    if (status === "inactive") {
      return "bg-gray-100 text-gray-700";
    }

    if (status === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "archived") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Client Management
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your clients and their information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            + Add Client
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <label
            htmlFor="client-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search Clients
          </label>

          <input
            id="client-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by client number, name, email, or phone..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
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
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              Loading clients...
            </p>
          </div>
        )}

        {/* CLIENT TABLE */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="border-b bg-gray-50">
                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Client Number
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
                      className="transition hover:bg-gray-50"
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
                          className="font-medium text-blue-600 hover:text-blue-800"
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
                  No clients found
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
              <div className="border-t bg-gray-50 px-6 py-4">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium text-gray-700">
                    {filteredClients.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700">
                    {clients.length}
                  </span>{" "}
                  clients
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            {/* MODAL HEADER */}
            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Client
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the client&apos;s information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddForm}
                disabled={saving}
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-black"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-black"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-black"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-black"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-black"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-black"
                  />
                </div>

              </div>

              {/* FORM BUTTONS */}
              <div className="mt-8 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Client"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </main>
  );
}

