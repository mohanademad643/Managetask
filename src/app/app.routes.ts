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
        path: '',
        loadChildren: () =>
          import('./feature/projects/project.routes').then(
            (m) => m.ProjectRoutes,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'projects' },
];
