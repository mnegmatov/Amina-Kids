/**
 * Formats a number with space-separated thousands (e.g. 12000 -> "12 000").
 * Locale-neutral: does not depend on any country/region locale string.
 */
export function formatPrice(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Normalizes phone numbers: retains leading '+' if present and strips all
 * non-digit characters (spaces, dashes, parentheses, dots).
 * Example: "+992 (90) 123-45-67" -> "+992901234567"
 * Example: "992 90 123 45 67" -> "992901234567"
 */
export function normalizePhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return '';
  const hasLeadingPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}

