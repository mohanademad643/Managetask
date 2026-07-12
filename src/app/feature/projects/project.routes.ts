import { Routes } from '@angular/router';


export const ProjectRoutes: Routes = [
  {
    path: 'project',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/projects-list/projects-list.component').then(
            (m) => m.ProjectsListComponent,
          ),
        title: 'Projects',
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./components/project-form/project-form.component').then(
            (m) => m.ProjectFormComponent,
          ),
        title: 'Add Project',
        data: { mode: 'create' },
      },
      {
        path: ':id',
        children: [
          {
            path: 'epics',
            loadComponent: () =>
              import('./components/project-epics/project-epics.component').then(
                (m) => m.ProjectEpicsComponent,
              ),

            title: 'Edit Project',
            data: { mode: 'edit' },
          },
          {
            path: 'edit',
            loadComponent: () =>
              import('./components/project-form/project-form.component').then(
                (m) => m.ProjectFormComponent,
              ),

            title: 'Edit Project',
            data: { mode: 'edit' },
          },
          {
            path: 'members',
            loadComponent: () =>
              import('./components/project-members/project-members.component').then(
                m => m.ProjectMembersComponent,
              ),
            title: 'Project Members',
          },
        ]
      },
    ],



  },

  { path: '', redirectTo: 'project', pathMatch: 'full' },
];