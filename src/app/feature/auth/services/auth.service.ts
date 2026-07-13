import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AuthSession,
  AuthUser,
} from '../../../core/models/auth';
import { environment } from '../../../../environments/environment.development';

const SESSION_KEY = 'Task_auth_session' as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth/v1`;
  private readonly _session = signal<AuthSession | null>(this.readSession());
  readonly session = computed(() => this._session());
  readonly token = computed(() => this._session()?.access_token ?? null);

  readonly isLoggedIn = computed(() => {
    const s = this._session();
    return !!s && s.expires_at > Math.floor(Date.now() / 1000);
  });

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, payload).pipe(
      tap((res) => this.persist(res)),
      catchError((err: HttpErrorResponse) =>
        throwError(
          () => err.error?.msg ?? 'Something went wrong. Please try again.',
        ),
      ),
    );
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/token?grant_type=password`, payload)
      .pipe(
        tap((res) => this.persist(res)),
        catchError((err: HttpErrorResponse) =>
          throwError(
            () => err.error?.msg ?? 'Something went wrong. Please try again.',
          ),
        ),
      );
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of();
      }),
    );
  }

  GetUserData() {
    return this.http.get<AuthUser>(`${this.baseUrl}/user`).pipe(
      map((user) => ({
        name: user.user_metadata.name,
        email: user.email,
        department: user.user_metadata.department,
      })),

      catchError((err: HttpErrorResponse) =>
        throwError(() => err.error?.msg ?? 'Failed to load user data.'),
      ),
    );
  }

 
  doRefreshToken() {
    const currentRefreshToken = this.session()?.refresh_token;

    if (!currentRefreshToken) {
      this.clearSession();
      return throwError(() => 'No refresh token available.');
    }
    return this.http.post<AuthResponse>(`${this.baseUrl}/token?grant_type=refresh_token`, {
        refresh_token: currentRefreshToken,
      })
      .pipe(
        tap((res) => this.persist(res)),
        map((res) => res.access_token),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),
      );
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this._session.set(null);
  }

  persist(res: AuthResponse): void {
    const session: AuthSession = {
      access_token: res.access_token,
      refresh_token: res.refresh_token,
      expires_at: res.expires_at,
      user: res.user,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this._session.set(session);
  }

  readSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  ForgetPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/recover`, { email }).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(
          () =>
            err.error?.msg ??
            err.error?.error_description ??
            'Something went wrong. Please try again.',
        ),
      ),
    );
  }
  ResetPassword(password:string,accessToken: string){
     return this.http.put<void>(`${this.baseUrl}/user`, { password },   { headers: { Authorization: `Bearer ${accessToken}` } }).pipe(
      catchError((err: HttpErrorResponse) =>
        throwError(
          () =>
            err.error?.msg ??
            err.error?.error_description ??
            'Something went wrong. Please try again.',
        ),
      ),
    );
  }


  CustomValidators(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return regex.test(control.value) ? null : error;
    };
  }


}
