// utils/index.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/object-update.ts

/**
 * Updates a nested property in an object safely
 * @param obj - The object to update (can be null or undefined)
 * @param path - Dot notation path to the property (e.g., 'user.profile.name')
 * @param value - The value to set at the specified path
 * @returns A new object with the updated value, or null if input is null
 * @throws Error if path is empty or invalid
 */
export function updateNestedObject<T extends Record<string, any>>(
  obj: T | null | undefined,
  path: string,
  value: any
): T | null {
  // Handle null/undefined input
  if (obj === null || obj === undefined) {
    if (!path) return value;
    return null;
  }

  // Validate path
  if (typeof path !== 'string' || path.trim() === '') {
    throw new Error('Path must be a non-empty string');
  }

  const keys = path.split('.');
  
  // Remove empty keys from path (e.g., 'a..b' becomes ['a', 'b'])
  const validKeys = keys.filter(key => key !== '');
  
  if (validKeys.length === 0) {
    throw new Error('Path contains no valid keys');
  }

  // Handle root level assignment
  if (validKeys.length === 1) {
    return { 
      ...obj, 
      [String(validKeys[0])]: value 
    } as T;
  }

  // Create a deep clone to avoid mutating the original object
  const result = { ...obj };
  let current: any = result;

  // Traverse the object, creating missing objects as needed
  for (let i = 0; i < validKeys.length - 1; i++) {
    const key = validKeys[i];
    
    // Ensure the current level is an object
    if (key === undefined) {
      throw new Error('Key is undefined');
    }
    if (current[key] === null || current[key] === undefined) {
      current[key] = {};
    } else if (typeof current[key] !== 'object' || Array.isArray(current[key])) {
      // If it's not a plain object, we can't safely traverse further
      // Create a new object, preserving the existing value if it's not at our target path
      current[key] = {};
    }
    
    current = current[key];
  }

  // Set the final value
  const finalKey = validKeys[validKeys.length - 1];
  if (finalKey === undefined) {
    throw new Error('Final key is undefined');
  }
  (current as Record<string, unknown>)[String(finalKey)] = value;

  return result;
}

/**
* Retrieves a nested property from an object using a dot notation path.
* @param obj - The object to retrieve from (can be null or undefined)
* @param path - Dot notation path to the property (e.g., 'user.profile.name')
* @returns The value at the specified path, or undefined if not found.
*/
export function getNestedObject(
obj: Record<string, any> | null | undefined,
path: string
): any {
if (!obj || typeof path !== "string" || path.trim() === "") {
  return undefined;
}

const keys = path.split(".").filter((key) => key !== "");

if (keys.length === 0) {
  return undefined;
}

let current: any = obj;

for (const key of keys) {
  if (current === null || current === undefined) {
    return undefined;
  }
  current = current[key];
}

return current;
}

export const getColsClass = (cols: number) => {
  const n = Math.max(1, Math.min(12, cols || 1));
  switch (n) {
    case 1:
      return "md:grid-cols-1";
    case 2:
      return "md:grid-cols-2";
    case 3:
      return "md:grid-cols-3";
    case 4:
      return "md:grid-cols-4";
    case 5:
      return "md:grid-cols-5";
    case 6:
      return "md:grid-cols-6";
    case 7:
      return "md:grid-cols-7";
    case 8:
      return "md:grid-cols-8";
    case 9:
      return "md:grid-cols-9";
    case 10:
      return "md:grid-cols-10";
    case 11:
      return "md:grid-cols-11";
    case 12:
      return "md:grid-cols-12";
    default:
      return "md:grid-cols-1";
  }
};