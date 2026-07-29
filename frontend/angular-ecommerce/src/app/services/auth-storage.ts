export const AUTH_STORAGE_KEY = 'brookyshop-auth';

export interface StoredAuth {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  birthDate: string | null;
  token: string;
  tokenExpiresAt: string;
}

export function readStoredAuth(): StoredAuth | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw) as Partial<StoredAuth>;
    if (!data.email || !data.token || !data.tokenExpiresAt) {
      clearStoredAuth();
      return null;
    }
    if (new Date(data.tokenExpiresAt).getTime() <= Date.now()) {
      clearStoredAuth();
      return null;
    }
    return data as StoredAuth;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function writeStoredAuth(auth: StoredAuth): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }
}

export function clearStoredAuth(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
