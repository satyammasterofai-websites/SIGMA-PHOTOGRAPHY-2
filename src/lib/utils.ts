import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1MB limit for Firestore doc. Let's limit file size to ~700KB max, safely 600KB to allow for base64 bloat
const MAX_FILE_SIZE = 600 * 1024; // 600KB

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error("File size exceeds Firestore storage limits. Please compress the file."));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const saveBase64ToFirestore = async (base64String: string, callback: (str: string) => Promise<void>) => {
  // Provided string will be saved using the callback method containing Firestore saving logic
  await callback(base64String);
};

export const loadBase64FromFirestore = async (callback: () => Promise<string | null>) => {
  return await callback();
};
