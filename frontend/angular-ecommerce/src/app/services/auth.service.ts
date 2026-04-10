import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthResponse {
  success: boolean;
  message: string;
  email: string | null;
  firstName: string | null;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const AUTH_KEY = 'brookyshop-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8080/api/auth';
  private readonly router = inject(Router);

  readonly isLoggedIn$ = new BehaviorSubject<boolean>(false);
  readonly userName$ = new BehaviorSubject<string | null>(null);
  readonly userEmail$ = new BehaviorSubject<string | null>(null);

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.isLoggedIn$.next(true);
          this.userName$.next(data.firstName ?? null);
          this.userEmail$.next(data.email ?? null);
        } catch {
          localStorage.removeItem(AUTH_KEY);
        }
      }
    }
  }

  signup(data: SignupData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data);
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        if (res.success && isPlatformBrowser(this.platformId)) {
          localStorage.setItem(AUTH_KEY, JSON.stringify({ email: res.email, firstName: res.firstName }));
          this.isLoggedIn$.next(true);
          this.userName$.next(res.firstName);
          this.userEmail$.next(res.email);
        }
      }),
    );
  }

  updateSettings(data: { email: string; firstName: string; lastName: string; currentPassword?: string; newPassword?: string }): Observable<AuthResponse> {
    const currentEmail = this.userEmail$.value;
    return this.http.put<AuthResponse>(`${this.apiUrl}/update?currentEmail=${currentEmail}`, data).pipe(
      tap((res) => {
        if (res.success && isPlatformBrowser(this.platformId)) {
          localStorage.setItem(AUTH_KEY, JSON.stringify({ email: res.email, firstName: res.firstName }));
          this.userName$.next(res.firstName);
          this.userEmail$.next(res.email);
        }
      })
    );
  }

  verifyEmail(data: { email: string, code: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-email`, data);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_KEY);
    }
    this.isLoggedIn$.next(false);
    this.userName$.next(null);
    this.userEmail$.next(null);
    this.router.navigate(['/login']);
  }
}
