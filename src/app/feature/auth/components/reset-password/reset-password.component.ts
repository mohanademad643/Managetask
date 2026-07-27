import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ValidationFieldComponent } from '../../../../shared/components/validation-field/validation-field.component';
import { ToastService } from '../../../../shared/services/toster.service';
import { AppHttpError } from '../../../../core/models/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationFieldComponent],
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  private readonly authServ = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastServ = inject(ToastService);
  readonly accessToken = signal<string | null>(
    this.route.snapshot.queryParamMap.get('access_token'),
  );

  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly loading = signal(false);
  readonly apiError = signal('');
  readonly success = signal(false);

  matchPasswords(control: AbstractControl) {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (newPassword?.value === confirmPassword?.value) {
      return null;
    } else {
      confirmPassword?.setErrors({ matchPasswords: 'Passwords do not match.' });
      return { matchPasswords: 'Passwords do not match.' };
    }
  }

  readonly form = this.fb.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
          this.authServ.CustomValidators(/^\S*$/, { noWhitespace: true }),
          this.authServ.CustomValidators(/(?=.*[A-Z])/, { noUppercase: true }),
          this.authServ.CustomValidators(/(?=.*[a-z])/, { noLowercase: true }),
          this.authServ.CustomValidators(/(?=.*[0-9])/, { noDigit: true }),
          this.authServ.CustomValidators(
            /(?=.*[!@#$%^&*()_+\-={}[\];:'"\\|,.<>?/])/,
            { noSpecialChar: true },
          ),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.matchPasswords },
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token = this.accessToken();
    if (!token) {
      this.apiError.set('Invalid or expired reset link.');
      return;
    }

    this.loading.set(true);
    this.apiError.set('');
     console.log(token);
    this.authServ
      .ResetPassword(this.form.getRawValue().newPassword!, token)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
             this.toastServ.show('Your password has been updated successfully. You can now log in', 'success');
         setTimeout(() => {
           this.router.navigate(['/auth/login']);
         }, 3000);  
        },
         error: (err: AppHttpError) => {
               this.apiError.set(err.message);
             },
      });
  }
}