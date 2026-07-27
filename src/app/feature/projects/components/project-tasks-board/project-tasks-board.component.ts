import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ColumnData, TASK_STATUS_CONFIGS, ViewState } from '../../../../core/models/project.model';
import { ProjectService } from '../../services/project.service';
import { TaskBoardViewComponent } from './components/task-board-view/task-board-view.component';
import { TaskListViewComponent } from './components/task-list-view/task-list-view.component';
import { TaskListMobileViewComponent } from "./components/task-list-mobile-view/task-list-mobile-view.component";

type TaskView = 'list' | 'board';

@Component({
  selector: 'app-project-tasks-board',
  standalone: true,
  imports: [RouterLink, TaskBoardViewComponent, TaskListViewComponent, TaskListMobileViewComponent],
  templateUrl: './project-tasks-board.component.html',
})
export class ProjectTasksBoardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectServ = inject(ProjectService);
  private readonly ref = inject(DestroyRef);

  readonly statuses = TASK_STATUS_CONFIGS;
  readonly activeView = signal<TaskView>('board');
  readonly viewMenuOpen = signal(false);
  readonly projectId = signal<string | null>(null);

  readonly columns = signal<ColumnData[]>(
    this.statuses.map(() => ({ state: 'loading' as ViewState, tasks: [] })),
  );

  readonly projectName = computed(() => {
    const id = this.projectId();
    return id ? (this.projectServ.findById(id)?.name ?? '') : '';
  });

  readonly allTasks = computed(() => this.columns().flatMap((column) => column.tasks));

  ngOnInit(): void {
    if (this.projectServ.projects().length === 0) {
      this.projectServ.getProjects().pipe(takeUntilDestroyed(this.ref)).subscribe({
        error: () => {},
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    this.projectId.set(id);
    if (id) this.loadColumns(id);
  }

  private loadColumns(projectId: string): void {
    this.statuses.forEach(({ status }, index) => {
      this.projectServ
        .getTasksByStatus(projectId, status)
        .pipe(takeUntilDestroyed(this.ref))
        .subscribe({
          next: (tasks) =>
            this.columns.update((cols) =>
              cols.map((c, i): ColumnData => (i === index ? { state: tasks.length === 0 ? 'empty' : 'data', tasks } : c)),
            ),
          error: () =>
            this.columns.update((cols) =>
              cols.map((c, i): ColumnData => (i === index ? { state: 'error', tasks: [] } : c)),
            ),
        });
    });
  }

  onViewChange(view: string): void {
    this.activeView.set(view as TaskView);
  }


}