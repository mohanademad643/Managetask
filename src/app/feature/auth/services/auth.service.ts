import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, map, shareReplay } from 'rxjs/operators';

import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AuthSession,
  AuthUser,
} from '../../../core/models/auth';
import { environment } from '../../../../environments/environment.development';

const SESSION_KEY = 'Task_auth_session' as const;
const TOKEN_KEY = 'Task_auth_token' as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth/v1`;
  private readonly _session = signal<AuthSession | null>(this.$readSession());
   private _refresh$: Observable<string> | null = null;
  readonly session = computed(() => this._session());
  readonly token = computed(() => this._session()?.access_token ?? null);
  readonly refreshToken = computed(
    () => this._session()?.refresh_token ?? null,
  );

  readonly isLoggedIn = computed(() => {
    const s = this._session();
    return !!s && s.expires_at > Math.floor(Date.now() / 1000);
  });

  readonly isExpired = computed(() => {
    const s = this._session();
    return !!s && s.expires_at <= Math.floor(Date.now() / 1000);
  });
  private readonly _refreshing = signal(false);
  private readonly _pendingToken = signal<string | null>(null);
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, payload).pipe(
      tap((res) => this.$persist(res)),
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
        tap((res) => this.$persist(res)),
        catchError((err: HttpErrorResponse) =>
          throwError(
            () => err.error?.msg ?? 'Something went wrong. Please try again.',
          ),
        ),
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}).pipe(
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

 

  doRefreshToken(): Observable<string> {
    const currentRefreshToken = this.refreshToken();

    if (!currentRefreshToken) {
      this.clearSession();
      return throwError(() => 'No refresh token available.');
    }

    if (this._refreshing() && this._refresh$) {
      return this._refresh$;
    }

    this._refreshing.set(true);
    this._pendingToken.set(null);

    this._refresh$ = this.http
      .post<AuthResponse>(`${this.baseUrl}/token?grant_type=refresh_token`, {
        refresh_token: currentRefreshToken,
      })
      .pipe(
        tap((res) => {
          this.$persist(res);
          this._pendingToken.set(res.access_token);
          this._refreshing.set(false);
          this._refresh$ = null;
        }),
        map((res) => res.access_token),
        catchError((err) => {
          this._refreshing.set(false);
          this._pendingToken.set(null);
          this._refresh$ = null;
          this.clearSession();
          return throwError(() => err);
        }),
        shareReplay(1),
      );

    return this._refresh$;
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this._session.set(null);
  }

  $persist(res: AuthResponse): void {
    const session: AuthSession = {
      access_token: res.access_token,
      refresh_token: res.refresh_token,
      expires_at: res.expires_at,
      user: res.user,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_KEY, res.access_token);
    this._session.set(session);
  }

  $readSession(): AuthSession | null {
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
  ResetPassword(password:string){
     return this.http.put<void>(`${this.baseUrl}/user`, { password });
  }
  CustomValidators(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return regex.test(control.value) ? null : error;
    };
  }

}
