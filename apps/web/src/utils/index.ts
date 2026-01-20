// Utility functions

/**
 * Combines class names using clsx and tailwind-merge
 */
export { clsx } from "clsx";
export { twMerge } from "tailwind-merge";

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

/**
 * Format datetime
 */
export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const maskEmail = (email?: string) => {
  if (!email) return "";

  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0]}***@${domain}`;

  return `${name[0]}***${name[name.length - 1]}@${domain}`;
};

export const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
