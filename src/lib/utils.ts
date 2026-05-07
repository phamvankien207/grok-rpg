import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeKey(key: string): string {
  if (!key) return '';
  // Remove BOM (\ufeff), other invisible characters, and trim whitespace
  return key.replace(/[\uFEFF\u200B\u200C\u200D\u200E\u200F\u00AD]/g, '').trim();
}
