import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { map, catchError, of } from "rxjs";
import { AuthService } from "../../feature/auth/services/auth.service";

export const authGuard: CanActivateFn = () => {
  const authServ = inject(AuthService);
  const router   = inject(Router);

  const session = authServ.readSession();

  if (!session?.access_token) {
    return router.createUrlTree(['/auth/login']);
  }

  const isExpired = session.expires_at <= Math.floor(Date.now() / 1000);
  if (!isExpired) return true;

  if (session.refresh_token) {
    return authServ.doRefreshToken().pipe(
      map(() => true),
      catchError(() => {
        authServ.clearSession();
        return of(router.createUrlTree(['/auth/login']));
      }),
    );
  }

  authServ.clearSession();
  return router.createUrlTree(['/auth/login']);
};