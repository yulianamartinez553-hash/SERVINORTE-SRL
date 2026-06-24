import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '')
    .trim()
    .slice(0, 1000);
}

export function validateFileType(file: File, allowed: string[]): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return allowed.includes(ext);
}

export function validateFileSize(file: File, maxMB: number): boolean {
  return file.size <= maxMB * 1024 * 1024;
}
