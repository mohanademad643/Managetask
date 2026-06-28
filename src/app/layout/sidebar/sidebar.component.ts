import { NgClass } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon: 'projects' | 'epics' | 'tasks' | 'members' | 'details';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Projects', route: 'projects', icon: 'projects' },
  { label: 'Project Epics', route: 'epics', icon: 'epics' },
  { label: 'Project Tasks', route: 'tasks', icon: 'tasks' },
  { label: 'Project Members', route: 'members', icon: 'members' },
  { label: 'Project Details', route: 'details', icon: 'details' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass,RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly collapsed = input<boolean>(false);
  readonly mobileOpen = input<boolean>(false);
  readonly collapseToggle = output<void>();
  readonly mobileClose = output<void>();
  readonly logoutClick = output<void>();

  readonly navItems = NAV_ITEMS;
}
