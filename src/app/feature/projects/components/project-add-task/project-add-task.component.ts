import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ValidationFieldComponent } from '../../../../shared/components/validation-field/validation-field.component';
import { CreateTaskPayload, Epic, ProjectMember, TaskStatus } from '../../../../core/models/project.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectService } from '../../services/project.service';


function formatStatusLabel(status: TaskStatus): string {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

@Component({
  selector: 'app-project-add-task',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationFieldComponent],

  templateUrl: './project-add-task.component.html'
})
export class ProjectAddTaskComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly projectServ = inject(ProjectService);
  private readonly ref = inject(DestroyRef);

  readonly projectId = signal<string | null>(null);

  readonly project = computed(() => {
    const id = this.projectId();
    return id ? this.projectServ.findById(id) : undefined;
  });

  readonly members = signal<ProjectMember[]>([]);
  readonly epics = signal<Epic[]>([]);
  readonly submitting = signal(false);
  readonly submitError = signal(false);

  readonly statusOptions = Object.values(TaskStatus).map((value) => ({
    value,
    label: formatStatusLabel(value),
  }));

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    status: [TaskStatus.ToDo, [Validators.required]],
    assigneeId: [''],
    epicId: [''],
    dueDate: [''],
    description: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.projectId.set(id);

    if (this.projectServ.projects().length === 0) {
      this.projectServ
        .getProjects()
        .pipe(takeUntilDestroyed(this.ref))
        .subscribe();
    }

    const epicId = this.route.snapshot.queryParamMap.get('epicId');
    if (epicId) {
      this.form.controls.epicId.setValue(epicId);
    }

    this.loadMembers();
    this.loadEpics();
  }

  loadMembers(): void {
    const id = this.projectId();
    if (!id) return;

    this.projectServ
      .getMembers(id)
      .pipe(takeUntilDestroyed(this.ref))
      .subscribe({
        next: (data) => this.members.set(data),
        error: () => this.members.set([]),
      });
  }

  loadEpics(): void {
    const id = this.projectId();
    if (!id) return;

    this.projectServ
      .getEpics(id)
      .pipe(takeUntilDestroyed(this.ref))
      .subscribe({
        next: ({ items }) => {this.epics.set(items) 
          console.log(items)
        },
        error: () => this.epics.set([]),
      });
  }


  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const projectId = this.projectId();
    if (!projectId) return;

    const payload: CreateTaskPayload = {
      project_id: projectId,
      title: this.form.value.title!,
      status: this.form.value.status!,
      epic_id: this.form.value.epicId || undefined,
      assignee_id: this.form.value.assigneeId || undefined,
      description: this.form.value.description || undefined,
      due_date: this.form.value.dueDate
        ? new Date(this.form.value.dueDate).toISOString()
        : undefined,
    };

    this.submitting.set(true);
    this.submitError.set(false);

    this.projectServ.createTask(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/project', projectId, 'tasks']);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }

  cancel(): void {
    const projectId = this.projectId();
    this.router.navigate(['/project', projectId, 'tasks']);
  }
}
