import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

export const supabaseInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({
    setHeaders: {
      apikey: environment.supabasepublicKey,
      ...(req.headers.has('Authorization')
        ? {}
        : { Authorization: `Bearer ${environment.supabasepublicKey}` }),
      'Content-Type': 'application/json',
    },
  });
  return next(apiReq);
};
