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
            path: 'epics/new',
            loadComponent: () =>
              import('./components/project-epic-form/project-epic-form.component').then(
                (m) => m.ProjectEpicFormComponent,
              ),
            title: 'Create Epic',
          },
          {
            path: 'tasks',
            loadComponent: () =>
              import('./components/project-tasks-board/project-tasks-board.component').then(
                (m) => m.ProjectTasksBoardComponent,
              ),
            title: 'Create Epic',
          },
           {
            path: 'tasks/new',
            loadComponent: () =>
              import('./components/project-add-task/project-add-task.component').then(
                (m) => m.ProjectAddTaskComponent,
              ),
            title: 'Create Task',
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