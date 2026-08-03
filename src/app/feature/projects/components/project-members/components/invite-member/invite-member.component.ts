import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ProjectService } from '../../../../services/project.service';
import { ValidationFieldComponent } from '../../../../../../shared/components/validation-field/validation-field.component';
import { ToastService } from '../../../../../../shared/services/toster.service';
import { ProjectMember } from '../../../../../../core/models/project.model';

@Component({
  selector: 'app-invite-member',
  standalone: true,
  imports: [ReactiveFormsModule, ValidationFieldComponent],
  templateUrl: './invite-member.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteMemberComponent {
  private readonly projectServ = inject(ProjectService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly submitting = signal(false);
  readonly projectId = input.required<string>();
  readonly projectName = input<string>('');
  readonly currentMembers = input<ProjectMember[]>([]);

  readonly closed = output<void>();
  readonly invited = output<void>();

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, this.ExsistMemberValidator()]],
  });


  close(): void {
    if (this.submitting()) return;
    this.closed.emit();
  }

  submit(): void {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.controls.email.markAsTouched();
      return;
    }

    this.submitting.set(true);

    this.projectServ
      .inviteMember(this.form.controls.email.value!, this.projectId())
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Invitation Member Sent Successfully.');
          this.invited.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.toast.error('Couldn\'t send the invitation. Please try again.');
          console.error('Error sending invitation:', err.message);
        },
      });
  }

  private ExsistMemberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim().toLowerCase();
      if (!value) return null;

      const isAlreadyMember = this.currentMembers().some(
        (member) => member.email?.trim().toLowerCase() === value,
      );

      return isAlreadyMember ? { alreadyMember: true } : null;
    };
  }

}