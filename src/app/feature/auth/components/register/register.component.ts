import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ValidationFieldComponent } from '../../../../shared/components/validation-field/validation-field.component';
import { RegisterRequest } from '../../../../core/models/auth';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationFieldComponent],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authServ = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly showPw = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly apiError = signal<string>('');
  matchPasswords(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password?.value === confirmPassword?.value) {
      return null;
    } else {
      confirmPassword?.setErrors({ matchPasswords: 'Passwords do not match.' });
      return { matchPasswords: 'Passwords do not match.' };
    }
  }

  readonly form = this.fb.group(
    {
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          this.authServ.CustomValidators(/^[^\d]*$/, { noNumbers: true }),
          this.authServ.CustomValidators(
            /^[^!@#$%^&*()_+\-={}[\];:'"\\|,.<>?/]*$/,
            { noSpecialChars: true },
          ),
          this.authServ.CustomValidators(/^[^\u{1F000}-\u{1FFFF}]*$/u, {
            noEmojis: true,
          }),
          this.authServ.CustomValidators(/^(?!.*\s{2})/, {
            noConsecutiveSpaces: true,
          }),
          this.authServ.CustomValidators(/^\S.*\S$|^\S$/, {
            noLeadingTrailingSpaces: true,
          }),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      title: [''],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
          this.authServ.CustomValidators(/^\S*$/, { noWhitespace: true }),
          this.authServ.CustomValidators(/(?=.*[A-Z])/, {
            noUppercase: true,
          }),
          this.authServ.CustomValidators(/(?=.*[a-z])/, {
            noLowercase: true,
          }),
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

    this.loading.set(true);
    this.apiError.set('');

    const payload: RegisterRequest = {
      email: this.form.getRawValue().email!,
      password: this.form.getRawValue().password!,
      data: {
        name: this.form.getRawValue().name!,
        department: this.form.getRawValue().title ?? '',
      },
    };

    this.authServ.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/projects']);
      },
      error: (message: string) => {
        this.loading.set(false);
        this.apiError.set(message);
      },
    });
  }
}
