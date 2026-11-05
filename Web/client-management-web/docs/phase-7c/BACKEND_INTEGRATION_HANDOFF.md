# Phase 7C backend integration handoff

## Current architecture

The Next.js App Router frontend uses `app/layout.tsx` for metadata, fonts, global CSS, and `AppShell`. `AppShell` excludes `/login` and `/register*` from the staff shell; all other routes receive the approved `Sidebar`. `PatientDialog` is the shared native-dialog primitive for patient forms. The phase-7B.4 patient styles are scoped in `app/globals.css` and do not create a separate component library.

The only frontend API helper is `app/lib/apiConfig.ts`. It validates the public API base origin and wraps `fetch`; it must never be given secrets. `app/lib/dateFormat.ts` distinguishes civil dates from offset-qualified instants and uses `Asia/Manila` for the latter. Philippine geographic options are frontend reference data, not a backend contract.

## Verified current backend surface (read-only inspection)

`Api/ClientManagement.Api` contains three API controllers only:

| Contract | Verified behavior | Important limitation |
| --- | --- | --- |
| `GET /api/Clients` | Lists Clients with Status, ordered by last name | No authorization/paging/search contract |
| `GET /api/Clients/{id}` | Includes Status, Contacts, Addresses, Documents, ActivityLogs | No authorization; response entity shape is directly exposed |
| `POST /api/Clients` | Creates a Client, assigns active status and generated client number | Unauthenticated; no transaction surrounding the two saves |
| `PUT /api/Clients/{id}` | Updates patient demographics and status | Unauthenticated; status validation is incomplete here |
| `PUT /api/Clients/{id}/status` | Validates status existence before update | Unauthenticated |
| `/api/clients/{clientId}/contacts` | GET/POST/GET-one/PUT/DELETE; primary flag clearing is implemented | Unauthenticated; concurrent primary updates need an integrity design |
| `/api/clients/{clientId}/addresses` | GET/POST/GET-one/PUT/DELETE; primary flag clearing is implemented | Unauthenticated; concurrent primary updates need an integrity design |

Identity foundation code exists: custom `User`/`Role` types, EF Identity stores, token providers, lockout/password settings, and migration `20261103092021_AddIdentityFoundation`. `Program.cs` explicitly says cookie endpoints and authorization enforcement are deferred. It does not register authentication/authorization middleware, and current controllers have no `[Authorize]` attributes. The configured CORS policy allows any origin, header, and method. Treat that as a local-development state, not a deployable security posture.

## Integration inventory

| Area / frontend route | UI state | Verified backend support | Missing capability and dependency | Priority / acceptance criterion |
| --- | --- | --- | --- | --- |
| Authentication and session / `/login` | Validation-only login form | Identity foundation only | Login endpoint/BFF, secure cookie/session lifecycle, CSRF strategy, logout | P0: unauthenticated staff requests cannot read/write protected data; logout terminates server session |
| Role authorization / all staff routes | Informational roles only | Seed roles and Identity types | Server policies and route/controller enforcement | P0: Administrator/Staff/Viewer permissions are tested server-side |
| Patient API security / `/Clients` | Real CRUD UI | Client, Contact, Address controllers | Authz, validation, DTO responses, pagination/search, concurrency/audit | P0: only permitted roles access scoped records; no entity overexposure |
| Public registration / `/register` | In-memory preview, submission disabled | None | Separate application model/API, server validation, abuse controls | P1: unauthenticated public request stores an application, not a patient |
| Registration review / `/registrations` | Preview queue/actions disabled | None | Staff review workflow, transactional approve/reject, duplicate controls | P1: approval atomically creates/links one patient and records actor/reason |
| Appointments / `/appointments` | Preview calendar/form | None | Scheduling model/API, provider/patient availability, conflict policy | P2: authorized create/update prevents conflicts and records timestamps |
| Clinical records / `/records` | Preview forms and FDI options | None | Clinical data model, validation, role policies, immutable/audited changes | P2: only authorized care staff can access patient-scoped records |
| Dental chart / patient profile | In-memory FDI interaction | None | Tooth-state/history persistence and clinical audit model | P2: 32-tooth data is patient-scoped, validated, and auditable |
| Treatments / profile + `/records` | Preview links/forms | None | Treatment/procedure contract linked to clinical records | P2: treatment history has authorized lifecycle and provenance |
| Billing / `/transactions` | Calculation preview; actions disabled | None | Invoice/payment ledger, currency/rounding, permissions, audit | P2: integer-centavo calculations and authorized non-idempotent writes are tested |
| Follow-ups / `/follow-ups` | Preview list/forms | None | Task/follow-up model, assignment, status/audit | P3: authorized staff can manage patient-scoped tasks |
| Documents / `/documents` | Preview; upload disabled | `ClientDocument` entity is present, no controller/storage path | Private R2, metadata API, malware/content controls, signed access | P2: server authorizes each upload/download; browser receives no storage secret |
| Reports / `/reports` | Seven preview categories; export disabled | None | Authorized aggregate queries, scope/timezone rules, export/audit controls | P3: only approved aggregates/exports are available by role |
| User administration / `/users` | Preview directory/roles, actions disabled | Identity models/roles only | Admin provisioning, password/reset lifecycle, role assignment restrictions | P3: Administrator-only operations, lockout and audit coverage |
| Audit events / `/audit-logs` | Preview empty collection | `ClientActivityLog` entity only | Append-only/protected audit writer/query service, actor/correlation/redaction | P1/P2: server records security and protected-data events without sensitive payloads |
| Clinic settings / `/settings` | Local validation; persistence disabled | None | Admin settings API, versioning, change history, secrets separation | P3: Administrator-only validated changes with audit record |
| Notifications | Unavailable preview | None | Provider integration, consent/preferences, delivery audit/retries | P4: no transmission without authorization and consent policy |
| Backup/recovery | Informational only | EF migrations exist | Backups, encryption, retention, restore rehearsal, RPO/RTO | P0 operational gate: tested restore before production data |

## Recommended dependency-aware implementation order

1. **Security foundation (P0):** rehearse the Identity migration only against disposable PostgreSQL; decide cookie/BFF versus another session architecture; add authentication, authorization policies, CSRF/cookie controls, restrictive CORS, secure logout, staff provisioning bootstrap, and authorization/audit protection for the existing Client API.
2. **Protect and harden patient records (P0):** replace entity responses with validated contracts, define optimistic concurrency and primary-contact/address integrity, add scoped audit events, then complete regression tests with disposable records.
3. **Public registration (P1):** use a separate registration-application store/workflow; add rate limiting/anti-abuse, server validation, staff review, duplicate prevention, transactional patient creation, and a stable public HTTPS registration domain. Keep staff access private.
4. **Core operations (P2):** appointments first, then clinical records/dental chart/treatments, then billing and follow-ups. Each needs a model, authorization matrix, audit obligations, and patient-scoped contracts before UI enablement.
5. **Supporting services (P2-P4):** private R2 documents, reporting, protected audit query UI, staff administration, settings, notifications, and tested recovery operations.

## Open technical decisions

- Which session architecture is suitable for the Next.js frontend and ASP.NET Core API (same-site secure cookie/BFF is the likely design to evaluate)?
- Which roles may read, edit, export, approve, bill, administer users, and restore data? Capture this as server policies, not just UI labels.
- What retention, correction, deletion, and audit requirements apply to Philippine patient, clinical, financial, and document data?
- How will clinician identity, authorship amendments, and record locking be modeled for clinical data?
- What availability/conflict rules govern appointments and which timezone/civil-date contracts are canonical?
- What deployment boundary separates public registration from the unauthenticated staff application?

## Integration safeguards

- Do not infer an endpoint from a frontend preview. Define versioned request/response contracts before enabling each control.
- Never expose R2, database, signing, or identity secrets through `NEXT_PUBLIC_*` variables.
- Preserve the frontend's date distinction: date-only values are civil dates; only offset-qualified values are instants.
- Use integer centavos/minor units and explicit rounding contracts for money.
- Rehearse every migration and restore on disposable infrastructure before shared or production databases.
