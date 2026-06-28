import { Routes } from '@angular/router';
import { AuthComponent } from './feature/auth/auth.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./feature/auth/components/login/login.component').then(
            (m) => m.LoginComponent,
          ),
        title: 'Log In',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./feature/auth/components/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
        title: 'Create Account',
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      {
        path: 'projects',
        loadComponent: () =>
          import('./feature/projects/projects.component').then(
            (m) => m.ProjectsComponent,
          ),
        title: 'Projects',
      },

      { path: '', redirectTo: 'projects', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'projects' },
];
