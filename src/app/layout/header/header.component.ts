import {
  Component,
  ChangeDetectionStrategy,
  output,
  computed,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { AuthService } from '../../feature/auth/services/auth.service';
import { UserProfile } from '../../core/models/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private _profile = signal<UserProfile | null>(null);
  readonly profile = computed(() => this._profile());
  readonly menuToggle = output<void>();
  readonly initials = computed(() =>
    this.profile()?.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );
  constructor() {
    if (this.auth.isLoggedIn()) {
      this.auth.GetUserData().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (data: UserProfile) => {
          this._profile.set(data);
          console.log(data);
        }
      });
    }
  }
}
