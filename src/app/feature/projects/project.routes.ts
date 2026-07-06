import { Routes } from '@angular/router';


export const ProjectRoutes: Routes = [
    {
        path: 'projects',
        loadComponent: () =>
          import('./components/projects-list/projects-list.component').then(
            (m) => m.ProjectsListComponent,
          ),
        title: 'Projects',
      },
      {
        path: 'projects/create',
        loadComponent: () =>
          import('./components/project-form/project-form.component').then(
            (m) => m.ProjectFormComponent,
          ),
        title: 'Add Project',
        data: { mode: 'create' },
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/project-form/project-form.component').then(
            (m) => m.ProjectFormComponent,
          ),
            
        title: 'Edit Project',
        data: { mode: 'edit' },
      },
      {
    path: ':id/members',
    loadComponent: () =>
      import('./components/project-members/project-members.component').then(
        m => m.ProjectMembersComponent,
      ),
    title: 'Project Members',
  },
      {path: '', redirectTo: 'projects', pathMatch: 'full'},
];