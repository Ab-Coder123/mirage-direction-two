import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPharmaTemperature(celsius: number): string {
  return `${celsius > 0 ? '+' : ''}${celsius.toFixed(1)}°C`;
}

export function formatBatchCode(code: string): string {
  return `LOT-${code.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
}
