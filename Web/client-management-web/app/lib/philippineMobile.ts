export type PhilippineMobileResult =
  | { valid: true; normalized: string }
  | { valid: false };

/**
 * Accepts Philippine mobile numbers only in the three supported forms and
 * returns the API-friendly local form. Whitespace inside a number is not
 * accepted; leading and trailing whitespace is ignored when saving.
 */
export function validatePhilippineMobile(value: string): PhilippineMobileResult {
  const trimmed = value.trim();

  if (/^09\d{9}$/.test(trimmed)) {
    return { valid: true, normalized: trimmed };
  }

  if (/^\+?639\d{9}$/.test(trimmed)) {
    return { valid: true, normalized: `0${trimmed.replace(/^\+?63/, "")}` };
  }

  return { valid: false };
}

export const philippineMobileFormatHint =
  "Use 09XXXXXXXXX, +639XXXXXXXXX, or 639XXXXXXXXX.";

/** Empty optional fields are valid; nonempty invalid values receive this UI error. */
export function philippineMobileValidationError(value: string): string {
  return value.trim() && !validatePhilippineMobile(value).valid
    ? philippineMobileFormatHint
    : "";
}
