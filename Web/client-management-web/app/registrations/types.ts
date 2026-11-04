// UI design contract only; the future service may define a different API shape.
export type RegistrationStatus = "Pending" | "Under Review" | "Approved" | "Rejected" | "Needs Correction";

export type RegistrationApplication = {
  id: string;
  referenceNumber: string;
  applicantName: string;
  submittedAt: string;
  status: RegistrationStatus;
  contactInformation: string;
  personalInformation: { label: string; value: string }[];
  contactDetails: { label: string; value: string }[];
  addressInformation: { label: string; value: string }[];
  submissionDetails: { label: string; value: string }[];
  reviewHistory: { id: string; description: string; occurredAt: string }[];
};
