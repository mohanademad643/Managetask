import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, takeWhile } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ValidationFieldComponent } from '../../../../shared/components/validation-field/validation-field.component';
import { AuthService } from '../../services/auth.service';

const Timer_DURATION_SECONDS = 5 * 60; 
const MAX_RESEND_ATTEMPTS = 3; 
const STORAGE_KEY = 'forgot_password_state';

interface SavedTimerState {
  attemptsLeft: number;
  TimerEndsAt: number; 
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationFieldComponent],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(false);
  readonly apiError = signal('');
  readonly submitted = signal(false);
  readonly attemptsLeft = signal(MAX_RESEND_ATTEMPTS);
  readonly remainingSeconds = signal(0);

  readonly canResend = computed(
    () => this.remainingSeconds() === 0 && this.attemptsLeft() > 0,
  );

  readonly formattedTime = computed(() => {
    const minutes = Math.floor(this.remainingSeconds() / 60);
    const seconds = this.remainingSeconds() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });


  constructor() {
    this.restoreTimerAfterRefresh();
  }


  onResend(): void {
    if (!this.canResend() || this.loading()) return;
    this.onSubmit();
  }

    onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.attemptsLeft() <= 0) return;

    this.loading.set(true);
    this.apiError.set('');

    const email = this.form.getRawValue().email!;

    this.authService.ForgetPassword(email).subscribe({
      next: () => this.handleSendSuccess(),
      error: (message: string) => {
          this.loading.set(false);
          this.apiError.set(message);
      },
    });
  }

  private handleSendSuccess(): void {
    this.loading.set(false);
    this.submitted.set(true);
    this.attemptsLeft.update((remaining) => remaining - 1);

    const TimerEndsAt = Date.now() + Timer_DURATION_SECONDS * 1000;
    this.saveTimerState(TimerEndsAt);
    this.startCount(TimerEndsAt);
  }

  private restoreTimerAfterRefresh(): void {
    const saved = this.loadTimerState();
    if (!saved) return;

    this.attemptsLeft.set(saved.attemptsLeft);

    if (saved.attemptsLeft < MAX_RESEND_ATTEMPTS) {
      this.submitted.set(true);
    }

    const secondsLeft = Math.ceil((saved.TimerEndsAt - Date.now()) / 1000);
    if (secondsLeft > 0) {
      this.startCount(saved.TimerEndsAt);
    }
  }


  private startCount(TimerEndsAt: number): void {
    const secondsLeft = (): number =>
      Math.max(0, Math.ceil((TimerEndsAt - Date.now()) / 1000));

    this.remainingSeconds.set(secondsLeft());

    interval(1000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeWhile(() => {
          const remaining = secondsLeft();
          this.remainingSeconds.set(remaining);
          return remaining > 0;
        }),
      )
      .subscribe();
  }

  private saveTimerState(TimerEndsAt: number): void {
      const state: SavedTimerState = {
        attemptsLeft: this.attemptsLeft(),
        TimerEndsAt,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  }

  private loadTimerState(): SavedTimerState | null {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedTimerState) : null;
 
  }
}