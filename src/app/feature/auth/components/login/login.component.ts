import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ValidationFieldComponent } from '../../../../shared/components/validation-field/validation-field.component';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../../../core/models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationFieldComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authServ = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });
  readonly showPwassword = signal(false);
  readonly loading = signal(false);
  readonly apiError = signal('');

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set('');

    const payload: LoginRequest = {
      email: this.form.getRawValue().email!,
      password: this.form.getRawValue().password!,
    };

    this.authServ.login(payload).subscribe({
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
