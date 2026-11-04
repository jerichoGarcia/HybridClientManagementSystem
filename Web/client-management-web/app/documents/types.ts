// Frontend design types only, not approved backend contracts.
export type DocumentCategory = "Dental X-rays" | "Clinical Photographs" | "Consent Forms" | "Prescriptions" | "Referral Letters" | "Laboratory Results" | "Treatment Documents" | "General Documents";
export type DentalImageCategory = "Panoramic X-rays" | "Periapical X-rays" | "Bitewing X-rays" | "Intraoral photographs" | "Extraoral photographs" | "Other diagnostic images";
export type ConsentFormStatus = "Draft" | "Pending Signature" | "Signed" | "Expired" | "Revoked";
export type DocumentStatus = "Active" | "Archived";
export interface PatientDocument { id: string; title: string; category: DocumentCategory; patient?: string; fileType?: string; fileSize?: string; documentDate?: string; uploadedDate?: string; uploadedBy?: string; description?: string; relatedClinicalRecord?: string; status?: DocumentStatus }
export interface ConsentForm { id: string; title: string; patient?: string; consentType: string; createdDate?: string; status: ConsentFormStatus; signedDate?: string }
