import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-bottom-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileBottomNavComponent {
  readonly navItems = NAV_ITEMS;
}
