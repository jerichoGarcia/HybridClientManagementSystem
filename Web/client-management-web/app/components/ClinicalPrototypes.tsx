"use client";

import { useState } from "react";

const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

function PrototypeNotice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900"><span className="font-semibold">Prototype · Not connected to clinical records. </span>{children}</div>;
}

function ReadOnlyFields({ title, fields }: { title: string; fields: string[] }) {
  return <section className={card}><h3 className="text-lg font-bold text-slate-900">{title}</h3><dl className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><dt className="text-sm font-medium text-slate-700">{field}</dt><dd className="mt-2 text-sm text-slate-500">Not recorded</dd></div>)}</dl></section>;
}

export function MedicalHistoryPrototype() {
  return <div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Patient records</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Medical History</h2><p className="mt-2 text-sm text-slate-600">A future home for information relevant to patient care.</p></div><PrototypeNotice>Medical history storage is not yet available. These fields cannot be edited or saved.</PrototypeNotice><ReadOnlyFields title="General Medical Information" fields={["Known medical conditions", "Previous surgeries or hospitalizations", "Current medications", "Known allergies", "Relevant medical alerts"]} /><ReadOnlyFields title="Dental Health Questionnaire" fields={["Previous dental treatment", "Tooth sensitivity", "Gum bleeding", "Dental pain", "Previous complications with anesthesia", "Dental treatment concerns"]} /><ReadOnlyFields title="Additional Information" fields={["Medical history review date", "Reviewed by", "Patient notes"]} /></div>;
}

const toothNames = ["Central incisor", "Lateral incisor", "Canine", "First premolar", "Second premolar", "First molar", "Second molar", "Third molar"];
const quadrants = [
  { label: "Upper right", numbers: [18, 17, 16, 15, 14, 13, 12, 11] },
  { label: "Upper left", numbers: [21, 22, 23, 24, 25, 26, 27, 28] },
  { label: "Lower right", numbers: [48, 47, 46, 45, 44, 43, 42, 41] },
  { label: "Lower left", numbers: [31, 32, 33, 34, 35, 36, 37, 38] },
];

function toothName(number: number) { return toothNames[(number % 10) - 1]; }

export function DentalChartPrototype() {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedQuadrant = quadrants.find((quadrant) => selected !== null && quadrant.numbers.includes(selected));
  return (
    <div className="min-w-0 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Permanent dentition · FDI notation</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Dental Chart</h2>
        <p className="mt-2 text-sm text-slate-600">Select a tooth to view its position. Right and left refer to the patient.</p>
      </div>
      <PrototypeNotice>Tooth selection is temporary and no findings or changes are saved.</PrototypeNotice>
      <div className={`${card} min-w-0`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900">Permanent teeth</h3>
          <span className="text-xs font-medium text-slate-500">FDI two-digit numbering</span>
        </div>
        <p id="chart-scroll-help" className="mb-4 text-sm text-slate-600">On a narrow screen, scroll each jaw left or right inside its bordered area to reach both quadrants. You can also use Tab to reach each tooth.</p>
        <div className="space-y-6">
          {["Upper", "Lower"].map((jaw, jawIndex) => (
            <section key={jaw} aria-labelledby={`${jaw.toLowerCase()}-jaw-heading`} className="min-w-0">
              <h4 id={`${jaw.toLowerCase()}-jaw-heading`} className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-600">{jaw} jaw</h4>
              <div role="region" aria-label={`${jaw} jaw teeth, scroll horizontally`} aria-describedby="chart-scroll-help" tabIndex={0} className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 bg-slate-50 p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                <div className="grid min-w-[660px] grid-cols-2 gap-4">
                  {quadrants.slice(jawIndex * 2, jawIndex * 2 + 2).map((quadrant) => (
                    <div key={quadrant.label}>
                      <p className="mb-2 text-center text-xs font-semibold text-slate-700">{quadrant.label}</p>
                      <div className="grid grid-cols-8 gap-1">
                        {quadrant.numbers.map((number) => (
                          <button key={number} type="button" title={`${quadrant.label} ${toothName(number)} · tooth ${number}`} aria-label={`Tooth ${number}, ${quadrant.label} ${toothName(number)}`} aria-pressed={selected === number} onClick={() => setSelected(number)} className={`h-12 rounded-lg border text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-600 ${selected === number ? "border-blue-700 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"}`}>{number}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
        <div aria-live="polite" className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {selected !== null && selectedQuadrant ? <><p className="font-semibold text-slate-900">Tooth {selected} · {toothName(selected)}</p><p className="mt-1 text-sm text-slate-600">{selectedQuadrant.label} quadrant</p><p className="mt-2 text-sm text-slate-600">Clinical findings are not recorded yet.</p></> : <><p className="font-semibold text-slate-900">No tooth selected</p><p className="mt-1 text-sm text-slate-600">Choose a number to see its location.</p></>}
        </div>
      </div>
    </div>
  );
}

export function TreatmentsPrototype() {
  return <div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Patient records</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Treatment History &amp; Plans</h2><p className="mt-2 text-sm text-slate-600">A future view of treatment records and plans.</p></div><PrototypeNotice>Treatment records and planning are not yet available. No clinical data can be saved here.</PrototypeNotice><section className={card}><h3 className="text-lg font-bold text-slate-900">Treatment History</h3><p className="mt-1 text-sm text-slate-600">Future records will include date, procedure, tooth number, provider, notes, and status.</p><div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"><p className="font-semibold text-slate-700">Treatment history is not available yet</p><p className="mt-1 text-sm text-slate-500">No treatment records are displayed in this prototype.</p></div></section><section className={card}><h3 className="text-lg font-bold text-slate-900">Treatment Plans</h3><p className="mt-1 text-sm text-slate-600">Future plans will include proposed procedure, planned date, priority, estimated cost, status, and assigned dentist.</p><div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"><p className="font-semibold text-slate-700">Treatment planning is not available yet</p><p className="mt-1 text-sm text-slate-500">No treatment plans are displayed in this prototype.</p></div></section></div>;
}
