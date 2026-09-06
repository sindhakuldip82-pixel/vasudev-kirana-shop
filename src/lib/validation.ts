export function isValidIndianMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return /^[6-9]\d{9}$/.test(last10);
}

export function normalizeMobile(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
}

export function isNonEmpty(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0;
}
