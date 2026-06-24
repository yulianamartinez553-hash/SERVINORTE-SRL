import { headers } from 'next/headers';
import crypto from 'crypto';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCSRFToken(token: string, expected: string): boolean {
  if (!token || !expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function getClientIP(): Promise<string> {
  const h = await headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  );
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>"'\;]/g, '')
    .trim()
    .slice(0, 2000);
}

export function validateDNI(dni: string): boolean {
  return /^\d{7,8}$/.test(dni);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^\+54\s?9?\s?\d{2,4}\s?\d{6,8}$/.test(phone.replace(/\s/g, ' '));
}
