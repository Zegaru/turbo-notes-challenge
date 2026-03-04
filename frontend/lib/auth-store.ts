const ACCESS_KEY = "auth_access";
const REFRESH_KEY = "auth_refresh";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function getAccessToken(): string | null {
  return safeGet(ACCESS_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function getRefreshToken(): string | null {
  return safeGet(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  safeSet(ACCESS_KEY, access);
  safeSet(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  safeRemove(ACCESS_KEY);
  safeRemove(REFRESH_KEY);
}
