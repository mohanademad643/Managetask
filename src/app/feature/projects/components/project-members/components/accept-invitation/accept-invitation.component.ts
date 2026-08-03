import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectService } from '../../../../services/project.service';
import { ToastService } from '../../../../../../shared/services/toster.service';
import { AuthService } from '../../../../../auth/services/auth.service';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [],
  templateUrl: './accept-invitation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptInvitationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectServ = inject(ProjectService);
  private readonly toast = inject(ToastService);
  private readonly authServ = inject(AuthService);
  private readonly ref = inject(DestroyRef);

  readonly token = signal<string | null>(null);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');

    if (!tokenParam) {
      this.toast.error('Invalid or missing invitation token.');
      this.router.navigate(['/']);
      return;
    }

    this.token.set(tokenParam);

    if (!this.authServ.isLoggedIn()) {
      this.toast.info('You need to log in before accepting this invitation.');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/invite', token: tokenParam },
      });
    }
  }

  AcceptedInvitation(): void {
    const token = this.token();
    if (!token || this.isLoading()) return;

    this.isLoading.set(true);

    this.projectServ
      .acceptInvitation(token)
      .pipe(takeUntilDestroyed(this.ref))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toast.success('Invitation accepted successfully! Welcome to the project.');
          this.router.navigate(['/project']);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.error('Failed to accept invitation or the link has expired.');
          this.router.navigate(['/auth/login']);
        },
      });
  }
}