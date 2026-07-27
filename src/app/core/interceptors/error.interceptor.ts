import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../feature/auth/services/auth.service';
import { ToastService } from '../../shared/services/toster.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const authServ = inject(AuthService);
    const toast = inject(ToastService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 0) {
                toast.error('Network error. Please check your connection.');
                return throwError(() => ({ type: 'error' as const, message: 'Network error' }));
            }

            if (err.status === 401) {
                authServ.clearSession();
                router.navigate(['/auth/login']);
                toast.error('Your session has expired. Please log in again.');
                return throwError(() => ({
                    type: 'unauthorized' as const,
                    status: err.status,
                    message: 'Session expired',
                }));
            }

            const message =
                err.error?.msg ??
                err.error?.error_description ??
                err.error?.message ??
                'Something went wrong. Please try again.';

            toast.error(message);

            return throwError(() => ({
                type: 'error' as const,
                status: err.status,
                message,
            }));
        }),
    );
};