import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  clearStoredAuth,
  readStoredAuth,
  StoredAuth,
  writeStoredAuth,
} from './auth-storage';
import { API_BASE_URL } from './api.config';

export interface AuthResponse {
  success: boolean;
  message: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  birthDate: string | null;
  token: string | null;
  tokenExpiresAt: string | null;
}

export interface SignupData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${inject(API_BASE_URL)}/auth`;
  private readonly router = inject(Router);

  readonly isLoggedIn$ = new BehaviorSubject<boolean>(false);
  readonly userName$ = new BehaviorSubject<string | null>(null);
  readonly userLastName$ = new BehaviorSubject<string | null>(null);
  readonly userPhone$ = new BehaviorSubject<string | null>(null);
  readonly userBirthDate$ = new BehaviorSubject<string | null>(null);
  readonly userEmail$ = new BehaviorSubject<string | null>(null);

  constructor(private readonly http: HttpClient) {
    const stored = readStoredAuth();
    if (stored) {
      this.applyStoredAuth(stored);
    }
  }

  signup(data: SignupData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data);
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        if (response.success && response.email && response.token && response.tokenExpiresAt) {
          this.persistResponse(response, response.token, response.tokenExpiresAt);
        }
      }),
    );
  }

  getProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/profile`).pipe(
      tap((response) => {
        if (response.success) {
          this.persistResponse(response);
        }
      }),
    );
  }

  updateSettings(data: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    birthDate?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/update`, data).pipe(
      tap((response) => {
        if (response.success) {
          this.persistResponse(response);
        }
      }),
    );
  }

  verifyEmail(data: { email: string; code: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-email`, data);
  }

  hasValidSession(): boolean {
    const stored = readStoredAuth();
    if (!stored) {
      return false;
    }
    if (!this.isLoggedIn$.value) {
      this.applyStoredAuth(stored);
    }
    return true;
  }

  logout(): void {
    if (this.hasValidSession()) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        error: () => {
          // Local logout still succeeds if the server is temporarily unavailable.
        },
      });
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    clearStoredAuth();
    this.isLoggedIn$.next(false);
    this.userName$.next(null);
    this.userLastName$.next(null);
    this.userPhone$.next(null);
    this.userBirthDate$.next(null);
    this.userEmail$.next(null);
  }

  private persistResponse(
    response: AuthResponse,
    token?: string,
    tokenExpiresAt?: string,
  ): void {
    const existing = readStoredAuth();
    const resolvedToken = token ?? existing?.token;
    const resolvedExpiry = tokenExpiresAt ?? existing?.tokenExpiresAt;
    if (!response.email || !resolvedToken || !resolvedExpiry) {
      this.clearSession();
      return;
    }

    const stored: StoredAuth = {
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      phoneNumber: response.phoneNumber,
      birthDate: response.birthDate,
      token: resolvedToken,
      tokenExpiresAt: resolvedExpiry,
    };
    writeStoredAuth(stored);
    this.applyStoredAuth(stored);
  }

  private applyStoredAuth(stored: StoredAuth): void {
    this.isLoggedIn$.next(true);
    this.userName$.next(stored.firstName);
    this.userLastName$.next(stored.lastName);
    this.userPhone$.next(stored.phoneNumber);
    this.userBirthDate$.next(stored.birthDate);
    this.userEmail$.next(stored.email);
  }
}
