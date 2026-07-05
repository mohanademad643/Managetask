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
        path: 'AddProject',
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
      {path: '', redirectTo: 'projects', pathMatch: 'full'},
];