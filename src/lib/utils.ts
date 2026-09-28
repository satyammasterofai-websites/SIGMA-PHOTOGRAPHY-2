import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1MB limit for Firestore doc. Let's limit file size to ~700KB max, safely 600KB to allow for base64 bloat
const MAX_FILE_SIZE = 600 * 1024; // 600KB

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress image to JPEG format with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileToBase64HD = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Higher dimensions for HD banners
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress image to JPEG format with 0.85 quality for HD
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
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

export function formatTemplateDate(dateVal: any): string {
  if (!dateVal) return "Recently Added";
  try {
    let d: Date;
    if (typeof dateVal === 'string' || typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else if (dateVal.toDate && typeof dateVal.toDate === 'function') {
      d = dateVal.toDate();
    } else if (dateVal.seconds) {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return "Recently Added";
    
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently Added";
  }
}

export function formatTemplateTime(dateVal: any): string {
  if (!dateVal) return "";
  try {
    let d: Date;
    if (typeof dateVal === 'string' || typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else if (dateVal.toDate && typeof dateVal.toDate === 'function') {
      d = dateVal.toDate();
    } else if (dateVal.seconds) {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return "";
    
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export function formatTemplateDateTime(dateVal: any): string {
  if (!dateVal) return "Recently Added";
  const dateStr = formatTemplateDate(dateVal);
  const timeStr = formatTemplateTime(dateVal);
  return timeStr ? `${dateStr} at ${timeStr}` : dateStr;
}

export function isNewlyCreated(dateVal: any, daysThreshold = 7): boolean {
  if (!dateVal) return false;
  try {
    let d: Date;
    if (typeof dateVal === 'string' || typeof dateVal === 'number') {
      d = new Date(dateVal);
    } else if (dateVal.toDate && typeof dateVal.toDate === 'function') {
      d = dateVal.toDate();
    } else if (dateVal.seconds) {
      d = new Date(dateVal.seconds * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return false;
    const diffMs = Date.now() - d.getTime();
    return diffMs >= 0 && diffMs <= daysThreshold * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
