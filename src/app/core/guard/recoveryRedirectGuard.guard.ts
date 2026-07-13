import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

export const recoveryRedirectGuard: CanActivateFn = (
  route,
  state: RouterStateSnapshot,
) => {
  const router = inject(Router);

  const fragment = state.root.fragment;

  if (!fragment || !fragment.includes('type=recovery')) {
    return true;
  }

  const params = new URLSearchParams(fragment);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken) {
    router.navigate(['/auth/reset-password']);
    return false;
  }

  router.navigate(['/auth/reset-password'], {
    queryParams: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });
  return false;
};




