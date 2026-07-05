import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ValidationFieldComponent } from '../../../../shared/components/validation-field/validation-field.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../../shared/services/toster.service';


@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationFieldComponent],
  templateUrl: './project-form.component.html'
})
export class ProjectFormComponent implements OnInit {
 private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectServ = inject(ProjectService);
   private readonly toastServ = inject(ToastService);
  readonly MaxChar = signal(500).asReadonly();

  readonly isEdit = signal(false);
  readonly projectId = signal<string | null>(null);

  readonly form = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    description: ['', [Validators.maxLength(this.MaxChar())]],
  });

  readonly loading = signal(false);
  readonly apiError = signal('');

  
   readonly descriptionValue = toSignal(
    this.form.controls.description.valueChanges,
    { initialValue: this.form.controls.description.value },
  );

  readonly descLength = computed(
    () => this.descriptionValue()?.length ?? 0,
  );

  ngOnInit(): void {
    const mode = this.route.snapshot.data['mode'] as 'create' | 'edit';
    this.isEdit.set(mode === 'edit');

    if (mode === 'edit') {
      const id = this.route.snapshot.paramMap.get('id');
      this.projectId.set(id);
      const project = this.projectServ.findById(id!);
      if (project) {
        this.form.patchValue({
          name: project.name,
          description: project.description,
        });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEdit()) {
      this.update(this.form.controls.name.value ?? '', this.form.controls.description.value ?? '');
    } else {
      this.create(this.form.controls.name.value ?? '', this.form.controls.description.value ?? '');
    }
  }

  private create(name: string, description: string): void {
    this.loading.set(true);
    this.apiError.set('');

    this.projectServ.createProject(name, description).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastServ.show('Project created successfully.', 'success');
        this.router.navigateByUrl('/projects');
      },
      error: (err: { message?: string }) => {
        this.loading.set(false);
        this.toastServ.show('Failed to create project.', 'error');
        this.apiError.set(
          err?.message ?? 'Something went wrong. Please try again.',
        );
      },
    });
  }

  private update(name: string, description: string): void {
    this.loading.set(true);
    this.apiError.set('');

    this.projectServ
      .updateProject(this.projectId()!, name, description)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.toastServ.show('Project updated successfully.', 'success');
          this.router.navigateByUrl('/projects');
        },
        error: (err: { message?: string }) => {
          this.loading.set(false);
          this.toastServ.show('Failed to update project.', 'error');
          this.apiError.set(
            err?.message ?? 'Something went wrong. Please try again.',
          );
        },
      });
  }
}
