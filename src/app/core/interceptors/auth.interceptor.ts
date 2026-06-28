import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../feature/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServ = inject(AuthService);
  const router = inject(Router);

  const session = authServ.$readSession();
  const isExpired = !!session && session.expires_at <= Date.now(); 

  const skipRefresh = req.url.includes('/token') || req.url.includes('/logout');

  if (isExpired && session?.refresh_token && !skipRefresh) {
    return authServ.doRefreshToken().pipe(
      switchMap((newToken: string) => next(addToken(req, newToken))),
      catchError((err) => {
        authServ.clearSession();
        router.navigate(['/auth/login']);
        return throwError(() => err);
      }),
    );
  }

  return next(addToken(req, authServ.token()));
};
function addToken(req: HttpRequest<unknown>, token: string | null) {
  if (!token) return req;
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}
