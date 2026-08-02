import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ColumnData, EpicTask, TASK_STATUS_CONFIGS, TaskDropEvent, ViewState } from '../../../../core/models/project.model';
import { ProjectService } from '../../services/project.service';
import { TaskBoardViewComponent } from './components/task-board-view/task-board-view.component';
import { TaskListViewComponent } from './components/task-list-view/task-list-view.component';
import { TaskListMobileViewComponent } from "./components/task-list-mobile-view/task-list-mobile-view.component";
import { ToastService } from '../../../../shared/services/toster.service';

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
   private readonly  toast = inject(ToastService);
  private readonly ref = inject(DestroyRef);
  readonly statuses = TASK_STATUS_CONFIGS;
  readonly activeView = signal<TaskView>('board');
  readonly viewMenuOpen = signal(false);
  readonly projectId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly tasks = signal<EpicTask[]>([]);
  readonly columns = computed<ColumnData[]>(() =>
    this.statuses.map(({ status }) => {
      const tasks = this.tasks().filter((t) => t.status === status);
      const state: ViewState = tasks.length ? 'data' : 'empty';
      return { state, tasks };
    }),
  );
  
  readonly allTasks = computed(() => this.tasks());

  readonly projectName = computed(() => {
    const id = this.projectId();
    return id ? (this.projectServ.findById(id)?.name ?? '') : '';
  });

  ngOnInit(): void {
    if (this.projectServ.projects().length === 0) {
      this.projectServ.getProjects().pipe(takeUntilDestroyed(this.ref)).subscribe({
        error: () => {},
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    this.projectId.set(id);
    if (id) this.GetTasksStatus(id);
  }

  private GetTasksStatus(projectId: string): void {
    this.statuses.forEach(({ status }) => {
      this.projectServ
        .getTasksByStatus(projectId, status)
        .pipe(takeUntilDestroyed(this.ref))
        .subscribe({
          next: (tasks) => {
            this.tasks.update((all) => [...all.filter((t) => t.status !== status), ...tasks]);
          }
        });
    });
  }

  onViewChange(view: string): void {
    this.activeView.set(view as TaskView);
  }

  TaskStatusDropped(event: TaskDropEvent): void {
    const { task, previousStatus, newStatus } = event;
    if (previousStatus === newStatus) return;

    task.status = newStatus;
    this.tasks.update((tasks) => [...tasks]);

    this.projectServ.updateTaskStatus(task.id, newStatus).pipe(takeUntilDestroyed(this.ref)).subscribe({
      error: () => {
        task.status = previousStatus;
        this.tasks.update((tasks) => [...tasks]);
        this.toast.error(`Couldn't move "${task.title}" Please try again.`);
      },
    });
  }
}