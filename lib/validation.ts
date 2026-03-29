/** Basic email shape check (not full RFC 5322). */
export function isValidEmail(email: string): boolean {
  const e = email.trim();
  if (!e || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
