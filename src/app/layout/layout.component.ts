import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MobileBottomNavComponent } from './mobile-bottom-nav/mobile-bottom-nav.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from '../feature/auth/services/auth.service';

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
