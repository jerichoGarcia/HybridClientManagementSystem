# Phase 7C frontend regression report

## Baseline and method

- Audited 2026-11-05 (Asia/Shanghai) on `main` at `50b69a3 Phase:7B.4 UI Polish`.
- `main` and `origin/main` both resolved to that commit after `git fetch --dry-run`; the pre-audit tree was clean.
- This was a frontend-only, read-only review. No patient, registration, billing, document, or backend operation was attempted.
- Route and interaction findings below are source-reviewed unless explicitly identified as a command/build result. Browser automation was unavailable because the browser automation host could not safely establish the active browser URL. It performed no page interaction.

## Automated checks

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript | Pass | `npx tsc --noEmit --incremental false` |
| Production build | Pass | `npm run build`; all 20 app routes generated/compiled |
| Configured ESLint | Pass | `npm run lint` |
| Production dependency audit | Pass | `npm audit --omit=dev`: 0 vulnerabilities |
| Diff whitespace check | Pass before documentation; rerun after documentation is required by the final checklist | `git diff --check` |

## Route inventory

| Route | Intended state from source review | Browser result |
| --- | --- | --- |
| `/` | Redirects to `/dashboard` | Not browser-tested |
| `/dashboard` | Connected patient summary and recent-patient display; unavailable/error handling is present | Not browser-tested |
| `/Clients` | Connected patient list, search, add-patient dialog, status display, loading/error/no-results states | Not browser-tested |
| `/Clients/[id]` | Connected patient profile; seven tabs; contacts and addresses CRUD; preview notices for unavailable clinical areas | Not browser-tested |
| `/registrations` | Frontend-only review queue with local controls and disabled decisions | Not browser-tested |
| `/appointments` | Frontend preview calendar and scheduling preview; final scheduling disabled | Not browser-tested |
| `/records` | Frontend preview clinical forms and FDI options; saving disabled | Not browser-tested |
| `/transactions` | Frontend preview invoice/payment workflow; final actions disabled | Not browser-tested |
| `/follow-ups` | Frontend preview task/follow-up workflow; final actions disabled | Not browser-tested |
| `/documents` | Frontend preview library/categories/consents; file selection/upload disabled | Not browser-tested |
| `/reports` | Frontend preview categories/range controls; metrics/exports unavailable | Not browser-tested |
| `/users` | Frontend preview roles and directory; account operations disabled | Not browser-tested |
| `/audit-logs` | Frontend preview empty event collection with local filters | Not browser-tested |
| `/settings` | Frontend preview six sections; validation-only clinic information and disabled persistence | Not browser-tested |
| `/login` | Client-side required-field validation only; explicitly says authentication is not configured | Not browser-tested |
| `/register` | In-memory multi-step public-registration preview; submission disabled | Not browser-tested |
| `/register/confirmation` | Explicitly says no registration has been submitted | Not browser-tested |
| `/register/qr` | QR poster with validated configured URL and print control | Not browser-tested |

## Functional regression findings

### Real backend-connected functionality

- The frontend uses `patientFetch` only for patient-related calls. Its default origin is `http://localhost:5110`; `NEXT_PUBLIC_API_BASE_URL` must be a strictly validated HTTP(S) origin. The helper rejects malformed/ambiguous origins and unsafe paths.
- `patientError` deliberately avoids rendering server bodies, request URLs, or exception messages. It maps configuration, network, and selected HTTP errors to understandable messages.
- Source review found unchanged client paths: `GET/POST /api/Clients`, `GET/PUT /api/Clients/{id}`, plus nested Contact and Address paths. Backend controller evidence is recorded in the handoff.
- The patient list search is local filtering. Patient create/edit/contact/address mutations were not exercised to avoid modifying records.

### Patient profile

- All seven tabs are retained: Overview, Medical History, Dental Chart, Treatments, Appointments, Documents, and Activity.
- Contacts and addresses have create/edit/delete UI, primary handling, and Philippine province/city controls. Backend controllers implement the primary-reset behavior, but it was not mutation-tested in this audit.
- The 32-tooth FDI chart and clinical/treatment/appointment/document notices remain frontend-only where secure services are absent. The UI does not claim unavailable clinical data exists.
- Date output uses the shared utilities: date-only values use civil-date formatting; explicitly offset-qualified timestamps are displayed in Asia/Manila. Offset-free timestamps are not silently treated as instants.

### Public registration and QR

- Registration uses local React state and explicitly says values disappear on refresh/navigation. Submission is disabled.
- The province/city dependency and validation are client-side preview behavior only.
- QR URL validation rejects localhost, loopback, credentials, unrelated paths, query/fragment data, and public HTTP. It permits HTTPS public origins and private RFC1918 IPv4 HTTP only for local/LAN testing.
- A stable public HTTPS registration URL, public-form abuse controls, and physical scan/print tests remain required before release. No public tunnel was used.

### Operational previews

Source review found preview notices, unavailable metrics, and disabled final actions across Registration Review, Appointments, Clinical Records, Transactions & Billing, Follow-ups & Tasks, Documents, Reports, User Management, Audit Logs, and Settings. No preview was found to persist data, send notifications, upload files, export reports, or create financial transactions. This needs browser confirmation before a release claim.

## Visual, responsive, and sidebar review

Phase 7B.4 added scoped patient UI conventions: slate surfaces, blue primary controls, bordered cards, visible focus treatment, responsive headers, mobile button stacking, and horizontally scrollable patient table behavior. The sidebar source retains the approved navy appearance, navigation order, blue active item, Settings location, divider, disabled compact Logout row, lock icon, and unavailable explanation.

No viewport can be recorded as passed. The following matrix is therefore **untested**, not passed:

| Viewport | Required manual coverage |
| --- | --- |
| 360px | Sidebar horizontal navigation, Patient table/profile tabs/chart scrolling, dialog width/actions |
| 400px | Registration steps, contact/address cards, header/button wrapping |
| 768px | Tablet sidebar/layout transition, tables, dialogs, calendar |
| 1024px | Desktop sidebar and page-header composition |
| 1440px | Wide-table/card layouts and spacing |

Do not hide page overflow globally as a substitute for checking these items.

## Accessibility review

### Evidence from source review

- The sidebar has `aria-label`, `aria-current`, and visible keyboard focus classes. Its Logout control is natively disabled and explained by `aria-describedby` text.
- Forms reviewed use labels, required indicators, `aria-invalid`, and error descriptions where client-side validation exists.
- `PatientDialog` uses native `<dialog>`, `aria-labelledby`, `showModal`, Escape handling that respects busy state, scroll locking, focus containment, background inertness provided by the native dialog, and focus restoration/fallback on close.
- Dialog styling limits size to the viewport and provides a visible focus indicator.
- Preview controls use disabled states and explanatory nearby text rather than pretending that actions succeed.

### Not completed / manual checklist

- Keyboard-only Tab and Shift+Tab traversal, Escape and focus restoration on each dialog.
- Screen-reader use; no assistive technology was available. This is not a WCAG conformance assessment.
- Browser-calculated color contrast and mobile reflow.
- Actual focus entry/recovery after opening Add/Edit Patient, Contact, and Address dialogs.

## Remaining manual test checklist

1. Start the local API and frontend with disposable/non-production data only.
2. Check every route in the route inventory at all five required widths and capture browser-console errors.
3. Test patient search and read-only loading/error states; do not mutate unless a disposable patient is explicitly approved.
4. If authorized, test one full disposable patient lifecycle, contact/address primary switching, and deletion cleanup; then remove the test record only under separate approved procedure.
5. Verify dialog keyboard behavior and profile-tab navigation.
6. Verify calendar and FDI-chart horizontal scrolling on a narrow viewport.
7. Test QR rendering and print layout on a private development network only; do not publish the staff app or relax QR URL validation.

## Defects and limitations

No compile, lint, or production-build defect was found. Browser regression evidence is incomplete, not negative: browser automation was blocked before navigation because it could not determine the current browser URL with sufficient confidence. The project must not be represented as browser-regression verified until the manual checklist is completed.
