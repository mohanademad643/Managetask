import { HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../../feature/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServ = inject(AuthService);
  const router = inject(Router);

  const session = authServ.readSession();
  const isExpired = !!session && session.expires_at <= Math.floor(Date.now() / 1000);

  const skipRefresh = req.url.includes('/token') || req.url.includes('/logout');
 if (isExpired && session?.refresh_token && !skipRefresh) {
    return new Observable<HttpEvent<unknown>>((subscriber) => {
      authServ.doRefreshToken()
        .pipe(switchMap((newToken: string) => next(addToken(req, newToken))))
        .subscribe({
          next: (event) => subscriber.next(event),
          error: (err) => {
            authServ.clearSession();
            router.navigate(['/auth/login']);
            subscriber.error(err);
          },
          complete: () => subscriber.complete(),
        });
    });
  }
 
  return next(addToken(req, authServ.token()));
};

function addToken(req: HttpRequest<unknown>, token: string | null) {
  if (!token) return req;
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}