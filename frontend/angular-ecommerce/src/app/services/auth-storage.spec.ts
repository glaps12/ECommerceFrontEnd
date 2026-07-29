import {
  AUTH_STORAGE_KEY,
  clearStoredAuth,
  readStoredAuth,
  StoredAuth,
  writeStoredAuth,
} from './auth-storage';

describe('auth storage', () => {
  afterEach(() => clearStoredAuth());

  it('restores a non-expired session', () => {
    const auth: StoredAuth = {
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      phoneNumber: null,
      birthDate: null,
      token: 'secret-token',
      tokenExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    };

    writeStoredAuth(auth);

    expect(readStoredAuth()).toEqual(auth);
  });

  it('removes expired sessions', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      email: 'demo@example.com',
      token: 'expired-token',
      tokenExpiresAt: new Date(Date.now() - 60_000).toISOString(),
    }));

    expect(readStoredAuth()).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
