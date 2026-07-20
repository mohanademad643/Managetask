import { Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Epic } from '../../../../core/models/project.model';
import { ProjectService } from '../../services/project.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-epic-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './epic-details.component.html'
})
export class EpicDetailsComponent implements OnInit {
readonly projectId = input.required<string>();
  readonly epicId = input.required<string>();
  readonly closed = output<void>();
 
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);
 
  readonly epic = signal<Epic | null>(null);
  readonly loading = signal(true);
  readonly hasError = signal(false);
 
  ngOnInit(): void {
    this.projectService
      .getEpicById(this.projectId(), this.epicId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (epic) => {
          this.epic.set(epic ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.loading.set(false);
        },
      });
  }
 
  close(): void {
    this.closed.emit();
  }
 
  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

}
