import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ProjectService } from '../../services/project.service';
import { CreateEpicPayload, ProjectMember } from '../../../../core/models/project.model';
import { ValidationFieldComponent } from '../../../../shared/components/validation-field/validation-field.component';

function todayOrFutureValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const selected = new Date(control.value);
  const today = new Date();
  return selected < today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-project-epic-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationFieldComponent],
  templateUrl: './project-epic-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectEpicFormComponent implements OnInit {
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
  readonly submitting = signal(false);
  readonly submitError = signal(false);

  readonly today = new Date().toISOString().split('T')[0];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(500)]],
    assigneeId: [''],
    deadline: ['', [todayOrFutureValidator]],
  });

  readonly descriptionLength = toSignal(
   this.form.controls.description.valueChanges,
    { initialValue: this.form.controls.description.value },
  );
 readonly descLength = computed(
    () => this.descriptionLength()?.length ?? 0,
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.projectId.set(id);

    if (this.projectServ.projects().length === 0) {
      this.projectServ
        .getProjects()
        .pipe(takeUntilDestroyed(this.ref))
        .subscribe();
    }

    this.loadMembers();
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const projectId = this.projectId();
    if (!projectId) return;

    const payload: CreateEpicPayload = {
      title: this.form.value.title!,
      project_id: projectId,
      description: this.form.value.description,
      assignee_id: this.form.value.assigneeId,
      deadline: this.form.value.deadline
    };

    this.submitting.set(true);
    this.submitError.set(false);

    this.projectServ.createEpic(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/project', projectId, 'epics']);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }

  cancel(): void {
    const projectId = this.projectId();
    this.router.navigate(['/project', projectId, 'epics']);
  }
}