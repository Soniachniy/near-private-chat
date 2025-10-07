import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimeRange = (timestamp: number | string) => {
  const now = new Date();
  const date = new Date(Number(timestamp) * 1000); // Convert Unix timestamp to milliseconds

  // Calculate the difference in milliseconds
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);

  const nowDate = now.getDate();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();

  const dateDate = date.getDate();
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();

  if (nowYear === dateYear && nowMonth === dateMonth && nowDate === dateDate) {
    return "Today";
  } else if (nowYear === dateYear && nowMonth === dateMonth && nowDate - dateDate === 1) {
    return "Yesterday";
  } else if (diffDays <= 7) {
    return "Previous 7 days";
  } else if (diffDays <= 30) {
    return "Previous 30 days";
  } else if (nowYear === dateYear) {
    return date.toLocaleString("default", { month: "long" });
  } else {
    return date.getFullYear().toString();
  }
};

export const formatFileSize = (size: number) => {
  if (size == null) return "Unknown size";
  if (typeof size !== "number" || size < 0) return "Invalid size";
  if (size === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const decodeString = (str: string) => {
  try {
    return decodeURIComponent(str);
  } catch (e: unknown) {
    console.error(e);
    return str;
  }
};
