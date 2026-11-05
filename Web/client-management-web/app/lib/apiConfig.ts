const localOrigin = "http://localhost:5110";

export class PatientApiError extends Error {
  constructor(public readonly kind: "configuration" | "network" | "http", public readonly status?: number) { super(kind); }
}

/** NEXT_PUBLIC values are embedded in the browser bundle: never put secrets here. */
export function apiUrl(path: string): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  const raw = configured === undefined ? localOrigin : configured;
  // Check the original authority and suffix before URL can normalize dot segments,
  // backslashes, empty query/fragment delimiters, or embedded whitespace.
  const match = /^(https?):\/\/(\[[0-9a-fA-F:.]+\]|[\p{L}\p{N}.-]+)(?::([0-9]{1,5}))?\/?$/iu.exec(raw);
  if (!match) throw new PatientApiError("configuration");
  const [, , host, port] = match;
  if (port && port.length > 1 && port.startsWith("0")) throw new PatientApiError("configuration");
  if (!host.startsWith("[")) {
    const labels = host.replace(/\.$/, "").split(".");
    if (labels.some((label) => !/^[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u.test(label))) throw new PatientApiError("configuration");
  }
  let url: URL;
  try { url = new URL(raw); } catch { throw new PatientApiError("configuration"); }
  if (!host.startsWith("[") && (url.hostname.replace(/\.$/, "").length > 253 || url.hostname.replace(/\.$/, "").split(".").some((label) => label.length > 63))) throw new PatientApiError("configuration");
  // Reject alternate numeric host spellings which URL would silently rewrite.
  if ((!host.startsWith("[") && /^[\x00-\x7F]+$/.test(host) && host.toLowerCase() !== url.hostname.toLowerCase()) || !path.startsWith("/") || path.startsWith("//")) throw new PatientApiError("configuration");
  return `${url.origin}${path}`;
}

let csrfToken: string | undefined;
let csrfRequest: Promise<string> | undefined;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  csrfRequest ??= (async () => {
    const response = await fetch(apiUrl("/api/auth/csrf"), { credentials: "include" });
    if (!response.ok) throw new PatientApiError("http", response.status);
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || typeof (payload as { requestToken?: unknown }).requestToken !== "string") throw new PatientApiError("http", response.status);
    csrfToken = (payload as { requestToken: string }).requestToken;
    return csrfToken;
  })();
  try { return await csrfRequest; }
  finally { csrfRequest = undefined; }
}

/** Sends credentialed requests and attaches an antiforgery token to unsafe methods. */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers);
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) headers.set("X-CSRF-TOKEN", await getCsrfToken());
  let response: Response;
  try { response = await fetch(url, { ...init, headers, credentials: "include" }); }
  catch (error) { if (init?.signal?.aborted) throw error; throw new PatientApiError("network"); }
  if (!response.ok) throw new PatientApiError("http", response.status);
  return response;
}

export async function patientFetch(path: string, init?: RequestInit): Promise<Response> {
  return apiFetch(path, init);
}

/** Diagnostics deliberately exclude exception messages, request URLs and server bodies. */
export function patientError(error: unknown, operation: string): string {
  const kind = error instanceof PatientApiError ? error.kind : "unexpected";
  const status = error instanceof PatientApiError ? error.status : undefined;
  console.error(`Patient service ${operation} failed`, status === undefined ? kind : `HTTP ${status}`);
  if (kind === "configuration") return "Invalid API configuration. Set NEXT_PUBLIC_API_BASE_URL to an HTTP(S) origin, then restart the frontend.";
  if (kind === "network") return "Unable to connect to the patient management service. Check that the API is running and reachable.";
  if (status === 401 || status === 403) return "Access to the patient service was denied.";
  if (status === 404) return "The requested patient or record was not found.";
  if (status === 400 || status === 422) return "The patient service rejected the submitted information. Check the fields and try again.";
  if (status === 409) return "The request conflicts with the current record. Refresh and try again.";
  return "The patient service could not complete the request. Please try again.";
}
