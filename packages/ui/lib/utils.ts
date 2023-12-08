import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string) {
  return str
    .toLowerCase() // Convert the string to lowercase
    .replace(/[^\w\s-]/g, "") // Remove all non-word characters (except hyphens and underscores)
    .replace(/\s+/g, "-") // Replace all spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple consecutive hyphens with a single hyphen
    .trim(); // Trim leading and trailing spaces (if any)
}
