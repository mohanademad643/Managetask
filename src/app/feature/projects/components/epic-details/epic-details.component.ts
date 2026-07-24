import { Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Epic, ProjectMember, UpdateEpicPayload } from '../../../../core/models/project.model';
import { ProjectService } from '../../services/project.service';
import { ValidationFieldComponent } from '../../../../shared/components/validation-field/validation-field.component';
import { ToastService } from '../../../../shared/services/toster.service';
import { SkeletonEpicDetailComponent } from "./components/skeleton-epic-detail/skeleton-epic-detail.component";
import { ErrorStateComponent } from "../../../../shared/components/error-state/error-state.component";

@Component({
  selector: 'app-epic-details',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, ValidationFieldComponent, SkeletonEpicDetailComponent, ErrorStateComponent],
  templateUrl: './epic-details.component.html',
})
export class EpicDetailsComponent implements OnInit {
  readonly projectId = input.required<string>();
  readonly epicId = input.required<string>();
  readonly closed = output<void>();
  readonly updated = output<Epic>();

  private readonly projectService = inject(ProjectService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly epic = signal<Epic | null>(null);
  readonly loading = signal(true);
  readonly hasError = signal(false);
  readonly members = signal<ProjectMember[]>([]);
  readonly editingAssignee = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    assigneeId: [''],
    deadline: [''],
  });

  ngOnInit(): void {
    this.loadEpic();
    this.loadMembers();
  }

  close(): void {
    this.closed.emit();
  }


  initials(name?: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  UpdateEpic(): void {
    if (this.form.invalid) return;

    const payload: UpdateEpicPayload =
    {
      title: this.form.value.title,
      description: this.form.value.description,
      assignee_id: this.form.value.assigneeId || null,
      deadline: this.form.value.deadline || null
    };

    this.projectService.updateEpic(this.epicId(), payload).subscribe({
      next: () => this.loadEpic(),
      error: () => {
        this.epic();
        this.toast.error('Failed to update epic. Please try again.');
      },
    });
  }

  private loadEpic(): void {
    this.projectService
      .getEpicById(this.projectId(), this.epicId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (epic) => {
          if (!epic) {
            this.hasError.set(true);
          } else {
            this.epic.set(epic);
            this.SetFormData(epic);
            this.updated.emit(epic);
          }
          this.loading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.loading.set(false);
        },
      });
  }

  private loadMembers(): void {
    this.projectService
      .getMembers(this.projectId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (members) => this.members.set(members),
      });
  }
  private SetFormData(epic: Epic): void {
    this.form.setValue({
      title: epic.title,
      description: epic.description ?? '',
      assigneeId: epic.assignee?.sub ?? '',
      deadline: epic.deadline ?? '',
    });
  }
}