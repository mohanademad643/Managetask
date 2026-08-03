import { Routes } from '@angular/router';
import { AuthComponent } from './feature/auth/auth.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guard/auth.guard';
import { recoveryRedirectGuard } from './core/guard/recoveryRedirectGuard.guard';

export const routes: Routes = [
  {
    path: 'auth',
    //  canActivate: [recoveryRedirectGuard],
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
     {
        path: 'forgot-password',
        loadComponent: () =>
          import('./feature/auth/components/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
        title: 'Forgot Password',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./feature/auth/components/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
        title: 'Reset Password',
      },

      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [recoveryRedirectGuard,authGuard],
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
   {
    path: 'invite',
    loadComponent: () =>
      import('./feature/projects/components/project-members/components/accept-invitation/accept-invitation.component').then(
        (m) => m.AcceptInvitationComponent,
      ),
    title: 'Accept Invitation',
  },

  { path: '**', redirectTo: 'project' ,pathMatch: 'full' },
];
