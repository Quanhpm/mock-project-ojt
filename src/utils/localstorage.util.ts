import { LOCAL_STORAGE } from "@/consts";
import type { UserAccount } from "@/models";

export function setItemInLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItemInLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    return JSON.parse(data) as T;
  } catch (error) {
    console.error("LocalStorage error:", error);
    return null;
  }
}

export function removeItemInLocalStorage(key: string): void {
  localStorage.removeItem(key);
}

// ===== AUTH HELPERS =====

export function getCurrentUser(): UserAccount | null {
  return getItemInLocalStorage<UserAccount>(LOCAL_STORAGE.ACCOUNT_ADMIN);
}

export function getCurrentUserId(): number | null {
  return getCurrentUser()?.id ?? null;
}

export function getCurrentUserRole(): string | null {
  return getCurrentUser()?.role ?? null;
}

export function isUserLoggedIn(): boolean {
  return !!getCurrentUser();
}
