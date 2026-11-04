"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAllMunicipalities,
  getAllProvinces,
} from "@aivangogh/ph-address";

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
  clientId: number;
  addressType: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isPrimary: boolean;
  dateCreated: string;
}

interface ClientDocument {
  id: number;
  documentName?: string;
  documentType?: string;
  filePath?: string;
  uploadedDate?: string;
}

interface ClientActivityLog {
  id: number;
  activityType?: string;
  description?: string;
  dateCreated?: string;
}

const profileTabs = ["Overview", "Medical History", "Dental Chart", "Treatments", "Appointments", "Documents", "Activity"] as const;
type ProfileTab = (typeof profileTabs)[number];

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

interface AddressFormValues {
  addressType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

interface AddressFormFieldsProps {
  values: AddressFormValues;
  idPrefix: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const PHONE_CONTACT_TYPES = new Set([
  "mobile",
  "landline",
  "phone",
  "telephone",
  "work phone",
  "work mobile",
  "work landline",
]);

const isPhoneContact = (contact: ClientContact) =>
  PHONE_CONTACT_TYPES.has((contact.contactType || "").trim().toLowerCase()) &&
  Boolean(contact.contactValue?.trim());

const formatPrimaryAddress = (address: ClientAddress) => {
  const values = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.province,
    address.postalCode,
    address.country,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return values.join(", ");
};

const ADDRESS_TYPES = ["Home", "Work", "Billing"] as const;
const PHILIPPINES = "Philippines";
const METRO_MANILA = "Metro Manila";
const BARMM_SPECIAL_GEOGRAPHIC_AREA = "BARMM Special Geographic Area";
const NCR_CODE = "1300000000";
const MANILA_SUB_MUNICIPALITY_PARENT_CODE = "1380600000";
const ISABELA_SPECIAL_AREA_CODE = "0990100000";
const BARMM_SPECIAL_GEOGRAPHIC_AREA_CODE = "1999900000";

const normalizeLocationValue = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\b(city|municipality|province|region|ncr|national capital)\b/g, "")
  .replace(/[^a-z0-9]/g, "");

const findCompatibleOption = (value: string, options: readonly string[]) =>
  options.find((option) =>
    normalizeLocationValue(option) === normalizeLocationValue(value)
  );

const provinceRecords = getAllProvinces();
const provinceNameByCode = new Map(
  provinceRecords.map((province) => [province.psgcCode, province.name])
);
const cityOptionsByProvince = new Map<string, string[]>();

for (const province of provinceRecords) {
  cityOptionsByProvince.set(province.name, []);
}

cityOptionsByProvince.set(METRO_MANILA, []);
cityOptionsByProvince.set(BARMM_SPECIAL_GEOGRAPHIC_AREA, []);

for (const municipality of getAllMunicipalities()) {
  if (municipality.provinceCode === MANILA_SUB_MUNICIPALITY_PARENT_CODE) {
    continue;
  }

  const provinceName = municipality.provinceCode === NCR_CODE
    ? METRO_MANILA
    : municipality.provinceCode === ISABELA_SPECIAL_AREA_CODE
      ? "Basilan"
      : municipality.provinceCode === BARMM_SPECIAL_GEOGRAPHIC_AREA_CODE
        ? BARMM_SPECIAL_GEOGRAPHIC_AREA
        : provinceNameByCode.get(municipality.provinceCode);

  if (provinceName) {
    cityOptionsByProvince.get(provinceName)?.push(municipality.name);
  }
}

for (const cities of cityOptionsByProvince.values()) {
  cities.sort((first, second) => first.localeCompare(second));
}

const PHILIPPINE_PROVINCE_OPTIONS = [
  ...provinceRecords.map((province) => province.name),
  METRO_MANILA,
  BARMM_SPECIAL_GEOGRAPHIC_AREA,
].sort((first, second) => first.localeCompare(second));

const getCityOptions = (province: string) =>
  cityOptionsByProvince.get(province) || [];

const getAddressValidationError = (form: AddressFormValues) => {
  if (!form.addressType.trim()) return "Address type is required.";
  if (!form.country.trim()) return "Country is required.";
  if (!form.province.trim()) return "Province or region is required.";
  if (!form.city.trim()) return "City or municipality is required.";

  const canonicalProvince = findCompatibleOption(
    form.province,
    PHILIPPINE_PROVINCE_OPTIONS
  );

  if (
    normalizeLocationValue(form.country) === normalizeLocationValue(PHILIPPINES) &&
    canonicalProvince &&
    !findCompatibleOption(form.city, getCityOptions(canonicalProvince))
  ) {
    return "Select a city or municipality that belongs to the selected province or region.";
  }

  return "";
};

function AddressFormFields({
  values,
  idPrefix,
  onChange,
}: AddressFormFieldsProps) {
  const isPhilippines = normalizeLocationValue(values.country) ===
    normalizeLocationValue(PHILIPPINES);
  const cityOptions = isPhilippines
    ? getCityOptions(values.province)
    : [];
  const hasValidProvince = Boolean(findCompatibleOption(
    values.province,
    PHILIPPINE_PROVINCE_OPTIONS
  ));
  const hasLegacyAddressType = values.addressType &&
    !findCompatibleOption(values.addressType, ADDRESS_TYPES);
  const hasLegacyCountry = values.country &&
    !findCompatibleOption(values.country, [PHILIPPINES]);
  const hasLegacyProvince = values.province &&
    !findCompatibleOption(values.province, PHILIPPINE_PROVINCE_OPTIONS);
  const hasLegacyCity = values.city && !findCompatibleOption(values.city, cityOptions);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label
          htmlFor={`${idPrefix}-addressType`}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Address Type
        </label>
        <select
          id={`${idPrefix}-addressType`}
          name="addressType"
          value={values.addressType}
          onChange={onChange}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
        >
          {hasLegacyAddressType && (
            <option value={values.addressType}>
              Existing value: {values.addressType}
            </option>
          )}
          {ADDRESS_TYPES.map((addressType) => (
            <option key={addressType} value={addressType}>
              {addressType}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor={`${idPrefix}-addressLine1`}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Address Line 1
        </label>
        <input
          id={`${idPrefix}-addressLine1`}
          name="addressLine1"
          type="text"
          value={values.addressLine1}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
        />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor={`${idPrefix}-addressLine2`}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Address Line 2
        </label>
        <input
          id={`${idPrefix}-addressLine2`}
          name="addressLine2"
          type="text"
          value={values.addressLine2}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-city`} className="mb-2 block text-sm font-medium text-gray-700">
          City
        </label>
        <select
          id={`${idPrefix}-city`}
          name="city"
          value={values.city}
          onChange={onChange}
          required
          disabled={!isPhilippines || !hasValidProvince}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="">
            {!isPhilippines ? "Select Philippines first" : !hasValidProvince ? "Select province / region first" : "Select city / municipality"}
          </option>
          {hasLegacyCity && (
            <option value={values.city}>Existing value: {values.city}</option>
          )}
          {cityOptions.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-province`} className="mb-2 block text-sm font-medium text-gray-700">
          Province / Region
        </label>
        <select
          id={`${idPrefix}-province`}
          name="province"
          value={values.province}
          onChange={onChange}
          required
          disabled={!isPhilippines}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="">Select province / region</option>
          {hasLegacyProvince && (
            <option value={values.province}>Existing value: {values.province}</option>
          )}
          {PHILIPPINE_PROVINCE_OPTIONS.map((province) => (
            <option key={province} value={province}>
              {province === METRO_MANILA ? "Metro Manila / NCR" : province}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-postalCode`} className="mb-2 block text-sm font-medium text-gray-700">
          Postal Code
        </label>
        <input id={`${idPrefix}-postalCode`} name="postalCode" type="text" value={values.postalCode} onChange={onChange} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black" />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-country`} className="mb-2 block text-sm font-medium text-gray-700">
          Country
        </label>
        <select
          id={`${idPrefix}-country`}
          name="country"
          value={values.country}
          onChange={onChange}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-black"
        >
          {hasLegacyCountry && (
            <option value={values.country}>Existing value: {values.country}</option>
          )}
          <option value={PHILIPPINES}>{PHILIPPINES}</option>
        </select>
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <input
          id={`${idPrefix}-isPrimary`}
          name="isPrimary"
          type="checkbox"
          checked={values.isPrimary}
          onChange={onChange}
          className="h-4 w-4"
        />
        <label htmlFor={`${idPrefix}-isPrimary`} className="text-sm font-medium text-gray-700">
          Set as primary address
        </label>
      </div>
    </div>
  );
}

const API_URL = "http://localhost:5110/api/Clients";

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ProfileTab>("Overview");
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

  // ADDRESS MANAGEMENT
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressFormError, setAddressFormError] = useState("");
  const [addressForm, setAddressForm] = useState<AddressFormValues>({
    addressType: "Home",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    country: PHILIPPINES,
    isPrimary: false,
  });
  const [showEditAddressForm, setShowEditAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [editAddressSaving, setEditAddressSaving] = useState(false);
  const [editAddressError, setEditAddressError] = useState("");
  const [editAddressForm, setEditAddressForm] = useState<AddressFormValues>({
    addressType: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    isPrimary: false,
  });
  const [addressToDelete, setAddressToDelete] = useState<ClientAddress | null>(null);
  const [addressDeleting, setAddressDeleting] = useState(false);
  const [deleteAddressError, setDeleteAddressError] = useState("");
  const deleteAddressInProgress = useRef(false);

  const clientId = params.id;

  const primaryPhoneContact = client?.contacts?.find(
    (contact) => contact.isPrimary && isPhoneContact(contact)
  );
  const displayPhoneNumber = primaryPhoneContact?.contactValue?.trim() ||
    client?.phoneNumber?.trim() || "-";
  const primaryAddress = client?.addresses?.find(
    (address) => address.isPrimary
  );
  const formattedPrimaryAddress = primaryAddress
    ? formatPrimaryAddress(primaryAddress)
    : "";
  const displayAddress = formattedPrimaryAddress || client?.address?.trim() || "-";

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
            throw new Error("Patient not found.");
          }

          throw new Error("Failed to load patient.");
        }

        const data: Client = await response.json();

        setClient(data);
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load patient.");
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
        alert("Patient updated successfully.");
      } catch (refreshError) {
        console.error(refreshError);
        alert(
          "Patient updated, but the profile could not be refreshed. Please reload the page."
        );
      }
    } catch (err) {
      console.error(err);

      alert(
        "Unable to update patient. Please check that the API is running."
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
  // ADDRESS MANAGEMENT
  // --------------------------------------------------

  const resetAddressForm = () => {
    setAddressForm({
      addressType: "Home",
      addressLine1: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      country: PHILIPPINES,
      isPrimary: false,
    });
  };

  const handleAddressChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox"
      ? (event.target as HTMLInputElement).checked
      : value;

    setAddressForm((previous) => ({
      ...previous,
      ...(name === "province" ? {
        province: value,
        city: findCompatibleOption(previous.city, getCityOptions(value)) || "",
      } : name === "country" ? {
        country: value,
        province: findCompatibleOption(
          previous.province,
          PHILIPPINE_PROVINCE_OPTIONS
        ) || "",
        city: "",
      } : {
        [name]: nextValue,
      }),
    }));
  };

  const handleEditAddressChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox"
      ? (event.target as HTMLInputElement).checked
      : value;

    setEditAddressForm((previous) => ({
      ...previous,
      ...(name === "province" ? {
        province: value,
        city: findCompatibleOption(previous.city, getCityOptions(value)) || "",
      } : name === "country" ? {
        country: value,
        province: findCompatibleOption(
          previous.province,
          PHILIPPINE_PROVINCE_OPTIONS
        ) || "",
        city: "",
      } : {
        [name]: nextValue,
      }),
    }));
  };

  const getAddressErrorMessage = async (
    response: Response,
    fallback: string
  ) => {
    try {
      const body: { message?: string } = await response.json();
      return body.message || fallback;
    } catch {
      return fallback;
    }
  };

  const toAddressPayload = (form: AddressFormValues) => ({
    addressType: form.addressType.trim(),
    addressLine1: form.addressLine1.trim() || null,
    addressLine2: form.addressLine2.trim() || null,
    city: form.city.trim() || null,
    province: form.province.trim() || null,
    postalCode: form.postalCode.trim() || null,
    country: form.country.trim() || null,
    isPrimary: form.isPrimary,
  });

  const updateAddressState = (updatedAddress: ClientAddress) => {
    setClient((previous) => {
      if (!previous) {
        return previous;
      }

      let updatedAddresses = (previous.addresses || []).map((address) =>
        address.id === updatedAddress.id ? updatedAddress : address
      );

      if (updatedAddress.isPrimary) {
        updatedAddresses = updatedAddresses.map((address) => ({
          ...address,
          isPrimary: address.id === updatedAddress.id,
        }));
      }

      return {
        ...previous,
        addresses: updatedAddresses,
      };
    });
  };

  const closeAddressForm = () => {
    if (addressSaving) {
      return;
    }

    setShowAddressForm(false);
    setAddressFormError("");
    resetAddressForm();
  };

  const handleAddAddress = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!client) {
      return;
    }

    const validationError = getAddressValidationError(addressForm);

    if (validationError) {
      setAddressFormError(validationError);
      return;
    }

    try {
      setAddressSaving(true);
      setAddressFormError("");

      const response = await fetch(`${API_URL}/${client.id}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toAddressPayload(addressForm)),
      });

      if (!response.ok) {
        throw new Error(await getAddressErrorMessage(
          response,
          "Unable to add address. Please try again."
        ));
      }

      const newAddress: ClientAddress = await response.json();

      setClient((previous) => {
        if (!previous) {
          return previous;
        }

        let updatedAddresses = [...(previous.addresses || []), newAddress];

        if (newAddress.isPrimary) {
          updatedAddresses = updatedAddresses.map((address) => ({
            ...address,
            isPrimary: address.id === newAddress.id,
          }));
        }

        return {
          ...previous,
          addresses: updatedAddresses,
        };
      });

      resetAddressForm();
      setShowAddressForm(false);
    } catch (err) {
      console.error(err);
      setAddressFormError(
        err instanceof Error ? err.message : "Unable to add address. Please try again."
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const openEditAddressForm = (address: ClientAddress) => {
    const addressType = findCompatibleOption(
      address.addressType || "",
      ADDRESS_TYPES
    ) || address.addressType || "";
    const country = findCompatibleOption(
      address.country || "",
      [PHILIPPINES]
    ) || address.country || "";
    const province = findCompatibleOption(
      address.province || "",
      PHILIPPINE_PROVINCE_OPTIONS
    ) || address.province || "";
    const city = findCompatibleOption(
      address.city || "",
      getCityOptions(province)
    ) || address.city || "";

    setEditingAddressId(address.id);
    setEditAddressError("");
    setEditAddressForm({
      addressType,
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city,
      province,
      postalCode: address.postalCode || "",
      country,
      isPrimary: address.isPrimary,
    });
    setShowEditAddressForm(true);
  };

  const handleUpdateAddress = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!client || editingAddressId === null) {
      return;
    }

    const validationError = getAddressValidationError(editAddressForm);

    if (validationError) {
      setEditAddressError(validationError);
      return;
    }

    try {
      setEditAddressSaving(true);
      setEditAddressError("");

      const response = await fetch(
        `${API_URL}/${client.id}/addresses/${editingAddressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(toAddressPayload(editAddressForm)),
        }
      );

      if (!response.ok) {
        throw new Error(await getAddressErrorMessage(
          response,
          "Unable to update address. Please try again."
        ));
      }

      const updatedAddress: ClientAddress = await response.json();
      updateAddressState(updatedAddress);
      setShowEditAddressForm(false);
      setEditingAddressId(null);
    } catch (err) {
      console.error(err);
      setEditAddressError(
        err instanceof Error ? err.message : "Unable to update address. Please try again."
      );
    } finally {
      setEditAddressSaving(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!client || !addressToDelete || deleteAddressInProgress.current) {
      return;
    }

    deleteAddressInProgress.current = true;
    setAddressDeleting(true);
    setDeleteAddressError("");

    try {
      const response = await fetch(
        `${API_URL}/${client.id}/addresses/${addressToDelete.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(await getAddressErrorMessage(
          response,
          "Unable to delete address. Please try again."
        ));
      }

      setClient((previous) => previous ? {
        ...previous,
        addresses: (previous.addresses || []).filter(
          (address) => address.id !== addressToDelete.id
        ),
      } : previous);
      setAddressToDelete(null);
    } catch (err) {
      console.error(err);
      setDeleteAddressError(
        err instanceof Error ? err.message : "Unable to delete address. Please try again."
      );
    } finally {
      deleteAddressInProgress.current = false;
      setAddressDeleting(false);
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
              Loading patient...
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
            ← Back to Patients
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-800">
              Unable to Load Patient
            </h1>

            <p className="mt-2 text-red-700">
              {error || "Patient not found."}
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
    <main className="min-h-screen min-w-0 bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => router.push("/Clients")}
          className="mb-6 font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Patients
        </button>

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-gray-500">
              Patient Profile
            </p>

            <h1 className="mt-1 break-words text-3xl font-bold text-gray-900">
              {client.firstName}{" "}
              {client.middleName
                ? `${client.middleName} `
                : ""}
              {client.lastName}
            </h1>

            <p className="mt-1 text-gray-500">
              {client.clientNumber}
            </p>
            <p className="mt-1 text-sm text-gray-500">Patient Information and Records</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openEditForm}
              className="rounded-lg bg-black px-5 py-2.5 font-medium text-white transition hover:bg-gray-800"
            >
              Edit Patient
            </button>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass()}`}
              >
                {getStatusName()}
            </span>

          </div>

        </div>

        <nav aria-label="Patient profile sections" className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
          <div className="flex w-max min-w-full gap-1">
            {profileTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-600 ${activeTab === tab ? "border-blue-600 text-blue-700" : "border-transparent text-slate-600 hover:text-slate-900"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        <div hidden={activeTab !== "Overview"}>
        {/* BASIC INFORMATION */}

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Patient Number
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
                {primaryPhoneContact ? "Primary Phone Number" : "Phone Number"}
              </p>

              <p className="mt-1 text-gray-900">
                {displayPhoneNumber}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">
                {formattedPrimaryAddress ? "Primary Address" : "Address"}
              </p>

              <p className="mt-1 text-gray-900">
                {displayAddress}
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
                  className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div>
                    <p className="font-medium text-gray-900">
                      {contact.contactType || "Contact"}
                    </p>

                    <p className="mt-1 break-all text-gray-600">
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

          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              Addresses
            </h2>

            <button
              type="button"
              onClick={() => {
                setAddressFormError("");
                setShowAddressForm(true);
              }}
              className="shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Address
            </button>
          </div>

          {client.addresses &&
          client.addresses.length > 0 ? (
            <div className="space-y-3">

              {client.addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {address.addressType}
                      </p>

                      {address.isPrimary && (
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="mt-1 space-y-1 break-words text-gray-600">
                      {address.addressLine1 && <p>{address.addressLine1}</p>}
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      {(address.city || address.province || address.postalCode) && (
                        <p>
                          {[address.city, address.province, address.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {address.country && <p>{address.country}</p>}
                      {!address.addressLine1 &&
                        !address.addressLine2 &&
                        !address.city &&
                        !address.province &&
                        !address.postalCode &&
                        !address.country && <p>-</p>}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditAddressForm(address)}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteAddressError("");
                        setAddressToDelete(address);
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
              No addresses added yet.
            </p>
          )}

        </section>

        </div>

        {activeTab === "Medical History" && <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-900">Medical History — Coming Soon</h2><p className="mt-2 text-sm text-slate-600">Medical history functionality is planned but not yet available.</p></section>}
        {activeTab === "Dental Chart" && <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-900">Dental Chart — Coming Soon</h2><p className="mt-2 text-sm text-slate-600">The dental chart is not yet available.</p></section>}
        {activeTab === "Treatments" && <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-900">Treatment History &amp; Plans — Coming Soon</h2><p className="mt-2 text-sm text-slate-600">Treatment history and planning are not yet available.</p></section>}
        {activeTab === "Appointments" && <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-900">Appointments — Coming Soon</h2><p className="mt-2 text-sm text-slate-600">Appointment management is not yet available.</p></section>}

        {/* DOCUMENTS */}

        <section hidden={activeTab !== "Documents"} className="mb-6 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Documents
          </h2>
          <p className="mb-4 text-sm text-gray-600">Document uploads and downloads are not yet available.</p>

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
                    {formatDate(document.uploadedDate)}
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

        <section hidden={activeTab !== "Activity"} className="mb-6 rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Activity Log
          </h2>
          <p className="mb-4 text-sm text-gray-600">Additional activity features are not yet available.</p>

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
                      {activity.activityType || "Activity"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatDate(activity.dateCreated)}
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
                  Edit Patient
                </h2>

                <p className="mt-1 text-gray-500">
                  Update the patient&apos;s information below.
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
                  Add a contact method for this patient.
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
      {showAddressForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Address
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add an address for this patient.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddressForm}
                disabled={addressSaving}
                aria-label="Close add address form"
                className="text-2xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAddress}>
              <AddressFormFields
                values={addressForm}
                idPrefix="add"
                onChange={handleAddressChange}
              />

              {addressFormError && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {addressFormError}
                </p>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddressForm}
                  disabled={addressSaving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addressSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditAddressForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Address
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update the address details below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditAddressForm(false)}
                disabled={editAddressSaving}
                aria-label="Close edit address form"
                className="text-2xl text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateAddress}>
              <AddressFormFields
                values={editAddressForm}
                idPrefix="edit"
                onChange={handleEditAddressChange}
              />

              {editAddressError && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {editAddressError}
                </p>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditAddressForm(false)}
                  disabled={editAddressSaving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editAddressSaving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editAddressSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-address-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="delete-address-title" className="text-2xl font-bold text-gray-900">
              Delete Address
            </h2>
            <p className="mt-4 break-words text-gray-700">
              Delete {addressToDelete.addressType}: {addressToDelete.addressLine1 || addressToDelete.city || "this address"}?
            </p>
            {deleteAddressError && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {deleteAddressError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={addressDeleting}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAddress}
                disabled={addressDeleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addressDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
