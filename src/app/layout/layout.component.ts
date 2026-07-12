import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MobileBottomNavComponent } from './mobile-bottom-nav/mobile-bottom-nav.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from '../feature/auth/services/auth.service';
import { map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    MobileBottomNavComponent,
  ],
  templateUrl: './layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  readonly sidebarCollapsed = signal(false);
  readonly mobileMenuOpen = signal(false);
  private readonly authServ = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  readonly projectId = signal<string | null>(null);
  constructor() {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(() => {
          let child = this.route;
          while (child.firstChild) {
            child = child.firstChild;
          }
          return child;
        }),
        switchMap((child) => child.paramMap),
      )
      .subscribe((paramMap) => {
        this.projectId.set(paramMap.get('id'));
      });
  }


  toggleCollapse(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  onLogout(): void {
    this.authServ.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}
