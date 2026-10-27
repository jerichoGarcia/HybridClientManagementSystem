"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ClientStatus {
  id: number;
  name: string;
  description?: string;
}

interface ClientContact {
  id: number;
  contactType?: string;
  contactValue?: string;
  isPrimary?: boolean;
}

interface ClientAddress {
  id: number;
  addressType?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface ClientDocument {
  id: number;
  documentName?: string;
  documentType?: string;
  filePath?: string;
  fileSize?: number;
  uploadedAt?: string;
}

interface ClientActivityLog {
  id: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  description?: string;
  createdAt?: string;
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

  contacts?: ClientContact[];
  addresses?: ClientAddress[];
  documents?: ClientDocument[];
  activityLogs?: ClientActivityLog[];
}

const API_URL = "http://localhost:5110/api/Clients";

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
  firstName: "",
  lastName: "",
  middleName: "",
  email: "",
  phoneNumber: "",
  address: "",
  statusId: 1, // Default to Active
  });

  // CONTACT MANAGEMENT
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);

  const [contactForm, setContactForm] = useState({
    contactType: "Mobile",
    contactValue: "",
    isPrimary: false,
  });

  // Edit Contact
  const [showEditContactForm, setShowEditContactForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);

  const [editContactForm, setEditContactForm] = useState({
    contactType: "Mobile",
    contactValue: "",
    isPrimary: false,
  });

  const [editContactSaving, setEditContactSaving] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ClientContact | null>(null);
  const [contactDeleting, setContactDeleting] = useState(false);
  const [deleteContactError, setDeleteContactError] = useState("");
  const deleteContactInProgress = useRef(false);

  const clientId = params.id;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const fetchClient = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/${clientId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Client not found.");
          }

          throw new Error("Failed to fetch client.");
        }

        const data: Client = await response.json();

        setClient(data);
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load client.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const getStatusName = () => {
    if (!client) {
      return "Unknown";
    }

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

  const getStatusClass = () => {
    const status = getStatusName().toLowerCase();

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

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  const openEditForm = () => {
  if (!client) {
    return;
  }

  setEditForm({
    firstName: client.firstName || "",
    lastName: client.lastName || "",
    middleName: client.middleName || "",
    email: client.email || "",
    phoneNumber: client.phoneNumber || "",
    address: client.address || "",
    statusId: client.statusId || 1, // Default to Active
  });

  setShowEditForm(true);
  };

  const handleEditChange = (
  event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateClient = async (
  event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!client) {
      return;
    }

    if (!editForm.firstName.trim()) {
      alert("First Name is required.");
      return;
    }

    if (!editForm.lastName.trim()) {
      alert("Last Name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/${client.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: editForm.firstName.trim(),
            lastName: editForm.lastName.trim(),
            middleName:
              editForm.middleName.trim() || null,
            email:
              editForm.email.trim() || null,
            phoneNumber:
              editForm.phoneNumber.trim() || null,
            address:
              editForm.address.trim() || null,
            statusId: editForm.statusId,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();

        console.error(
          "Update client failed:",
          errorMessage
        );

        throw new Error("Failed to update client.");
      }

      setClient((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          middleName: editForm.middleName.trim() || null,
          email: editForm.email.trim() || null,
          phoneNumber: editForm.phoneNumber.trim() || null,
          address: editForm.address.trim() || null,
          statusId: editForm.statusId,
          status: previous.statusId === editForm.statusId
            ? previous.status
            : null,
        };
      });

      setShowEditForm(false);

      try {
        const refreshResponse = await fetch(
          `${API_URL}/${client.id}`,
          { cache: "no-store" }
        );

        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh client profile.");
        }

        const refreshedClient: Client = await refreshResponse.json();
        setClient(refreshedClient);
        alert("Client updated successfully.");
      } catch (refreshError) {
        console.error(refreshError);
        alert(
          "Client updated, but the profile could not be refreshed. Please reload the page."
        );
      }
    } catch (err) {
      console.error(err);

      alert(
        "Unable to update client. Please check that the API is running."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // CONTACT MANAGEMENT
  // --------------------------------------------------

  const handleContactChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (
        event.target as HTMLInputElement
      ).checked;

      setContactForm((previous) => ({
        ...previous,
        [name]: checked,
      }));

      return;
    }

    setContactForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetContactForm = () => {
    setContactForm({
      contactType: "Mobile",
      contactValue: "",
      isPrimary: false,
    });
  };

  const openEditContactForm = (contact: ClientContact) => {
    setEditingContactId(contact.id);

    setEditContactForm({
      contactType: contact.contactType || "Mobile",
      contactValue: contact.contactValue || "",
      isPrimary: contact.isPrimary || false,
    });
    setShowEditContactForm(true);
  };

  const handleEditContactChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (
        event.target as HTMLInputElement
      ).checked;

      setEditContactForm((previous) => ({
        ...previous,
        [name]: checked,
      }));

      return;
    }

    setEditContactForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateContact = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!client || editingContactId === null) {
      return;
    }

    if (!editContactForm.contactType.trim()) {
      alert("Please select a contact type.");
      return;
    }

    if (!editContactForm.contactValue.trim()) {
      alert("Please enter a contact value.");
      return;
    }

    try {
      setEditContactSaving(true);

      const response = await fetch(
        `${API_URL}/${client.id}/contacts/${editingContactId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactType:
              editContactForm.contactType,
            contactValue:
              editContactForm.contactValue.trim(),
            isPrimary:
              editContactForm.isPrimary,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();

        console.error(
          "Update contact failed:",
          errorMessage
        );

        throw new Error("Failed to update contact.");
      }

      const updatedContact: ClientContact =
        await response.json();

      setClient((previous) => {
        if (!previous) {
          return previous;
        }

        let updatedContacts =
          (previous.contacts || []).map((contact) =>
            contact.id === updatedContact.id
              ? updatedContact
              : contact
          );

        // Only one contact can be primary
        if (updatedContact.isPrimary) {
          updatedContacts = updatedContacts.map((contact) => ({
            ...contact,
            isPrimary: contact.id === updatedContact.id,
          }));
        }

        return {
          ...previous,
          contacts: updatedContacts,
        };
      });

      setShowEditContactForm(false);
      setEditingContactId(null);

      alert("Contact updated successfully.");
    } catch (err) {
      console.error(err);

      alert(
        "Unable to update contact. Please check that the API is running."
      );
    } finally {
      setEditContactSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!client || !contactToDelete || deleteContactInProgress.current) {
      return;
    }

    deleteContactInProgress.current = true;
    setContactDeleting(true);
    setDeleteContactError("");

    try {
      const response = await fetch(
        `${API_URL}/${client.id}/contacts/${contactToDelete.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(`Delete contact failed (${response.status}).`);
      }

      setClient((previous) => previous ? {
        ...previous,
        contacts: (previous.contacts || []).filter(
          (contact) => contact.id !== contactToDelete.id
        ),
      } : previous);
      setContactToDelete(null);
    } catch (err) {
      console.error(err);
      setDeleteContactError("Unable to delete contact. Please try again.");
    } finally {
      deleteContactInProgress.current = false;
      setContactDeleting(false);
    }
  };

  const closeContactForm = () => {
    if (contactSaving) {
      return;
    }

    setShowContactForm(false);
    resetContactForm();
  };

  const handleAddContact = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!client) {
      return;
    }

    if (!contactForm.contactType.trim()) {
      alert("Please select a contact type.");
      return;
    }

    if (!contactForm.contactValue.trim()) {
      alert("Please enter a contact value.");
      return;
    }

    try {
      setContactSaving(true);

      const response = await fetch(
        `${API_URL}/${client.id}/contacts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactType:
              contactForm.contactType,
            contactValue:
              contactForm.contactValue.trim(),
            isPrimary:
              contactForm.isPrimary,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();

        console.error(
          "Add contact failed:",
          errorMessage
        );

        throw new Error("Failed to add contact.");
      }

      const newContact: ClientContact =
        await response.json();

        setClient((previous) => {
        if (!previous) {
          return previous;
        }

        let updatedContacts = [
          ...(previous.contacts || []),
          newContact,
        ];

        // If the new contact is primary,
        // make all other contacts non-primary.
        if (newContact.isPrimary) {
          updatedContacts =
            updatedContacts.map((contact) => ({
              ...contact,
              isPrimary:
                contact.id === newContact.id,
            }));
        }

        return {
          ...previous,
          contacts: updatedContacts,
        };
      });

      resetContactForm();
      setShowContactForm(false);

      alert("Contact added successfully.");
    } catch (err) {
      console.error(err);

      alert(
        "Unable to add contact. Please check that the API is running."
      );
    } finally {
      setContactSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-700">
              Loading client...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error || !client) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">

          <button
            type="button"
            onClick={() => router.push("/Clients")}
            className="mb-6 font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Clients
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-800">
              Unable to Load Client
            </h1>

            <p className="mt-2 text-red-700">
              {error || "Client not found."}
            </p>
          </div>

        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => router.push("/Clients")}
          className="mb-6 font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Clients
        </button>

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-gray-500">
              Client Profile
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {client.firstName}{" "}
              {client.middleName
                ? `${client.middleName} `
                : ""}
              {client.lastName}
            </h1>

            <p className="mt-1 text-gray-500">
              {client.clientNumber}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openEditForm}
              className="rounded-lg bg-black px-5 py-2.5 font-medium text-white transition hover:bg-gray-800"
            >
              Edit Client
            </button>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass()}`}
              >
                {getStatusName()}
            </span>

          </div>

        </div>

        {/* BASIC INFORMATION */}

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Client Number
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {client.clientNumber || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                First Name
              </p>

              <p className="mt-1 text-gray-900">
                {client.firstName || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Middle Name
              </p>

              <p className="mt-1 text-gray-900">
                {client.middleName || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Last Name
              </p>

              <p className="mt-1 text-gray-900">
                {client.lastName || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Email
              </p>

              <p className="mt-1 text-gray-900">
                {client.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Phone Number
              </p>

              <p className="mt-1 text-gray-900">
                {client.phoneNumber || "-"}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">
                Address
              </p>

              <p className="mt-1 text-gray-900">
                {client.address || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Status
              </p>

              <span
                className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusClass()}`}
              >
                {getStatusName()}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Date Created
              </p>

              <p className="mt-1 text-gray-900">
                {formatDate(client.dateCreated)}
              </p>
            </div>

          </div>

        </section>

        {/* CONTACTS */}

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-bold text-gray-900">
              Contacts
            </h2>

            <button
              type="button"
              onClick={() => setShowContactForm(true)}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Contact
            </button>

          </div>

          {client.contacts &&
          client.contacts.length > 0 ? (

            <div className="space-y-3">

              {client.contacts.map((contact) => (

                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >

                  <div>
                    <p className="font-medium text-gray-900">
                      {contact.contactType || "Contact"}
                    </p>

                    <p className="mt-1 text-gray-600">
                      {contact.contactValue || "-"}
                    </p>

                    {contact.isPrimary && (
                      <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        Primary
                      </span>
                    )}

                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditContactForm(contact)}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteContactError("");
                        setContactToDelete(contact);
                      }}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>

                </div>

              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              No contacts available.
            </p>

          )}

        </section>

        {/* ADDRESSES */}

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Addresses
          </h2>

          {client.addresses &&
          client.addresses.length > 0 ? (
            <div className="space-y-3">

              {client.addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <p className="font-medium text-gray-900">
                    {address.addressType || "Address"}
                  </p>

                  <p className="mt-1 text-gray-600">
                    {[
                      address.street,
                      address.barangay,
                      address.city,
                      address.province,
                      address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-500">
              No addresses available.
            </p>
          )}

        </section>

        {/* DOCUMENTS */}

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Documents
          </h2>

          {client.documents &&
          client.documents.length > 0 ? (
            <div className="space-y-3">

              {client.documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <p className="font-medium text-gray-900">
                    {document.documentName || "Document"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {document.documentType || "Unknown type"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Uploaded:{" "}
                    {formatDate(document.uploadedAt)}
                  </p>
                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-500">
              No documents available.
            </p>
          )}

        </section>

        {/* ACTIVITY LOG */}

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Activity Log
          </h2>

          {client.activityLogs &&
          client.activityLogs.length > 0 ? (
            <div className="space-y-3">

              {client.activityLogs.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                    <p className="font-medium text-gray-900">
                      {activity.action || "Activity"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatDate(activity.createdAt)}
                    </p>

                  </div>

                  {activity.description && (
                    <p className="mt-2 text-gray-600">
                      {activity.description}
                    </p>
                  )}

                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-500">
              No activity logs available.
            </p>
          )}

        </section>

      </div>

      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            
            {/* MODAL HEADER */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Client
                </h2>

                <p className="mt-1 text-gray-500">
                  Update the client&apos; information below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                disabled={saving}
                className="text-2xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
              >
                *
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleUpdateClient}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                {/* FIRST NAME */}

                <div>
                  <label
                    htmlFor="edit-firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>

                  <input
                    type="text"
                    id="edit-firstName"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  />
                </div>

                {/* LAST NAME */}
                <div>
                  <label
                    htmlFor="edit-lastName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>

                  <input
                    type="text"
                    id="edit-lastName"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  />
                </div>

                {/* MIDDLE NAME */}
                <div>
                  <label
                    htmlFor="edit-middleName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Middle Name
                  </label>

                  <input
                    type="text"
                    id="edit-middleName"
                    name="middleName"
                    value={editForm.middleName}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="edit-email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  />
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label
                    htmlFor="edit-phoneNumber"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="edit-phoneNumber"
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  />
                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="edit-address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="edit-address"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  />
                </div>

                {/* STATUS */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="edit-status"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="edit-status"
                    name="statusId"
                    value={editForm.statusId}
                    onChange={event => setEditForm(prev => ({ ...prev, statusId: parseInt(event.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  >
                    <option value={1}>Active</option>
                    <option value={2}>Inactive</option>
                    <option value={3}>Pending</option>
                    <option value={4}>Archived</option>
                  </select>
                </div>

              </div>
              
              {/* BUTTONS */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg border border-transparent bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
      {showContactForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Add Contact
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a contact method for this client.
                </p>

              </div>

              <button
                type="button"
                onClick={closeContactForm}
                disabled={contactSaving}
                className="text-2xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
              >
                ×
              </button>

            </div>

            {/* CONTACT FORM */}

            <form onSubmit={handleAddContact}>

              <div className="space-y-5">

                {/* CONTACT TYPE */}

                <div>

                  <label
                    htmlFor="contactType"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Contact Type
                  </label>

                  <select
                    id="contactType"
                    name="contactType"
                    value={contactForm.contactType}
                    onChange={handleContactChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  >

                    <option value="Mobile">
                      Mobile
                    </option>

                    <option value="Email">
                      Email
                    </option>

                    <option value="Landline">
                      Landline
                    </option>

                    <option value="Work">
                      Work
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* CONTACT VALUE */}

                <div>

                  <label
                    htmlFor="contactValue"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Contact Information
                  </label>

                  <input
                    id="contactValue"
                    name="contactValue"
                    type="text"
                    value={contactForm.contactValue}
                    onChange={handleContactChange}
                    required
                    placeholder="09171234567"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                  />

                </div>

                {/* PRIMARY */}

                <div className="flex items-center gap-3">

                  <input
                    id="isPrimary"
                    name="isPrimary"
                    type="checkbox"
                    checked={contactForm.isPrimary}
                    onChange={handleContactChange}
                    className="h-4 w-4"
                  />

                  <label
                    htmlFor="isPrimary"
                    className="text-sm font-medium text-gray-700"
                  >
                    Set as primary contact
                  </label>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-8 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeContactForm}
                  disabled={contactSaving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={contactSaving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {contactSaving
                    ? "Saving..."
                    : "Save Contact"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-contact-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="delete-contact-title" className="text-2xl font-bold text-gray-900">
              Delete Contact
            </h2>
            <p className="mt-4 text-gray-700">
              Delete {contactToDelete.contactType || "Contact"}: {contactToDelete.contactValue || "-"}?
            </p>
            {deleteContactError && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {deleteContactError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                disabled={contactDeleting}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteContact}
                disabled={contactDeleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {contactDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Contact
                </h2>

                <p className="mt-1 text-gray-500">
                  Update the contact information below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditContactForm(false)}
                disabled={editContactSaving}
                className="text-2xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleUpdateContact}>

              {/* CONTACT TYPE */}

              <div className="mb-5">
                <label
                  htmlFor="edit-contactType"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Contact Type
                </label>

                <select
                  id="edit-contactType"
                  name="contactType"
                  value={editContactForm.contactType}
                  onChange={handleEditContactChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                >
                  <option value="Mobile">
                    Mobile
                  </option>

                  <option value="Email">
                    Email
                  </option>

                  <option value="Landline">
                    Landline
                  </option>

                  <option value="Work">
                  Work
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* CONTACT VALUE */}

              <div className="mb-5">
                <label
                  htmlFor="edit-contactValue"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Contact Value
                </label>

                <input
                  type="text"
                  id="edit-contactValue"
                  name="contactValue"
                  value={editContactForm.contactValue}
                  onChange={handleEditContactChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
                />
              </div>

              {/* PRIMARY */}

              <div className="mb-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-isPrimary"
                  name="isPrimary"
                  checked={editContactForm.isPrimary}
                  onChange={handleEditContactChange}
                  className="h-4 w-4"
                />

                <label
                  htmlFor="edit-isPrimary"
                  className="text-sm font-medium text-gray-700"
                >
                  Set as primary contact
                </label>
              </div>

              {/* BUTTONS */}

              <div className="flex items-center justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowEditContactForm(false)}
                  disabled={editContactSaving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editContactSaving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed"
                >
                  {editContactSaving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </main>
  );
}