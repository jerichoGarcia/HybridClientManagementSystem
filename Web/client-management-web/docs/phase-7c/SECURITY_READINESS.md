# Phase 7C security and privacy readiness

## Status

**Not ready for real patient-data deployment.** The application intentionally has preview-only modules and a real but currently unauthenticated patient API. Disabled UI controls are product-state messaging, not security controls.

## Confirmed safeguards

- Frontend patient API configuration validates the browser-visible API base origin and does not accept credentials or unsafe paths.
- Patient request errors use generalized messages rather than exposing server bodies, request URLs, or exception text in the UI.
- Registration preview remains in browser memory, disables submission, and warns users not to enter real personal information.
- QR registration configuration rejects localhost/loopback, credentials, unrelated paths, query/fragment values, public HTTP, and unsafe address forms. Public use requires HTTPS.
- Preview operations clearly state unavailable behavior and keep final schedule/save/upload/export/payment/account actions disabled.
- Patient dialogs use native modal semantics, focus containment/restoration, Escape handling, and scroll locking.
- Project documentation already calls for private R2, server-side authorization, malware/type/size validation, signed/controlled download, and audit history before document storage.
- ASP.NET Core Identity groundwork includes password complexity, lockout configuration, role types, Identity stores, data protection registration, and token providers.

## Deployment blockers

| Blocker | Evidence | Required remediation before real data |
| --- | --- | --- |
| No staff authentication/session | Login is validation-only; API does not configure auth middleware/endpoints | Implement and test secure staff authentication, cookie/session lifecycle, CSRF defenses, logout, lockout/recovery, and secure cookie settings |
| No server authorization | No `[Authorize]` on inspected controllers; no authorization middleware | Define least-privilege policies and enforce them on every protected endpoint/server operation |
| Unauthenticated patient CRUD | Existing Client, Contact, Address controllers mutate data directly | Protect, validate, audit, scope, and concurrency-test patient APIs before any network exposure |
| Permissive CORS | `AllowAnyOrigin`, `AllowAnyHeader`, `AllowAnyMethod` | Restrict to explicit deployed origins and compatible credential policy |
| Preview-only operational data | No verified controllers for clinical, schedule, billing, documents, reports, registrations, etc. | Build server contracts, authorization, validation, audit and privacy controls before enabling UI |
| No document storage security path | Entity exists; no storage/controller integration | Private bucket, server credentials, content checks, malware strategy, authorized short-lived access/streaming, retention/deletion/audit |
| No production audit system | Activity entity exists but no verified protected audit writer/query service | Server-created, protected/tamper-resistant event history with actor/correlation/redaction/retention |
| No proven backup/restore practice | Preview only | Document encrypted backup strategy; rehearse restores; define RPO/RTO and restricted restore authority |
| Public form not production-ready | In-memory preview only | Separate application workflow, HTTPS domain, rate limiting/anti-abuse, validation, monitoring, and privacy notice/retention decisions |

## Identity migration precautions

The repository contains `AddIdentityFoundation`, including normalized username/role checks and Identity schema additions. It is not evidence that authentication is enabled. Before applying it to any shared PostgreSQL/Neon environment:

1. Obtain explicit approval and inventory the target schema/data.
2. Back up and rehearse on an isolated disposable PostgreSQL copy.
3. Validate case-normalization collisions, role data, rollback expectations, and application startup behavior.
4. Apply through an approved migration process with monitoring and a tested rollback/recovery plan.
5. Create the initial administrator securely; never seed reusable production credentials into source control.

## Privacy requirements before deployment

- Classify patient demographics, contacts, addresses, clinical records, documents, registration applications, and financial data as protected information.
- Enforce authenticated, role-scoped access on the server; client-side hiding/disabled controls are insufficient.
- Minimize API response fields, avoid returning EF entities directly, and log access/events without unnecessarily logging sensitive content.
- Define data retention, correction, deletion, consent, breach response, and staff training procedures with the clinic's legal/compliance advice.
- Restrict reports/exports to authorized aggregates; prevent data disclosure through filters, URLs, logs, error messages, and document links.
- Keep the staff application inaccessible from the public internet until authentication, authorization, and deployment controls are complete. Public registration must be a separately secured HTTPS surface.

## Release gate

Do not use real patient data or publicly deploy the staff system until every deployment blocker has an implemented, tested, and reviewed mitigation. In particular, completion requires real browser/accessibility regression results, secure staff identity and authorization, protected Client APIs, restrictive CORS, an audit approach, private document design, and a rehearsed recovery plan.
