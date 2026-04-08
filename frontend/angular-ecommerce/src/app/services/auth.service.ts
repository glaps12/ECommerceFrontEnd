import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthResponse {
  success: boolean;
  message: string;
  email: string | null;
  firstName: string | null;
}

export interface SignupData {
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
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  readonly isLoggedIn$ = new BehaviorSubject<boolean>(false);
  readonly userName$ = new BehaviorSubject<string | null>(null);

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
        }
      }),
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
  }
}
