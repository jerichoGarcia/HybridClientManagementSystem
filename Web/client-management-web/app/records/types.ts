// Frontend design types only; these are not approved backend contracts.
export type Consultation = { id: string; date: string; patient: string; chiefComplaint: string; attendingDentist: string; status: string; history: string; examination: string; assessment: string; recommendations: string; followUpDate?: string };
export type DentalDiagnosis = { id: string; date: string; patient: string; toothNumber?: string; clinicalFinding: string; diagnosis: string; priority?: string; attendingDentist: string; status: string; notes?: string };
export type DentalProcedure = { id: string; date: string; patient: string; procedureType: string; toothNumber?: string; attendingDentist: string; status: string; notes?: string; followUpRecommendation?: string };
export type ClinicalTreatmentNote = { id: string; date: string; patient: string; relatedConsultation?: string; relatedDiagnosisOrProcedure?: string; attendingDentist: string; summary: string; followUpInstructions?: string };
