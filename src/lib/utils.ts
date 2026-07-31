import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalArray<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function getLocalObject<T = Record<string, any>>(key: string): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {} as T;
  }
}
