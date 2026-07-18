import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Epic, ViewState } from '../../../../core/models/project.model';
import { ErrorStateComponent } from "../../../../shared/components/error-state/error-state.component";
import { SkeletonEpicComponent } from "./components/skeleton-epic/skeleton-epic.component";
import { EpicEmptyStateComponent } from "./components/epic-empty-state/epic-empty-state.component";
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-project-epics',
  standalone: true,
  imports: [RouterLink, DatePipe, ErrorStateComponent, SkeletonEpicComponent, EpicEmptyStateComponent],
  templateUrl: './project-epics.component.html',
})
export class ProjectEpicsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly Destrouref = inject(DestroyRef);
  private readonly projectService = inject(ProjectService);
  readonly projectId = signal<string | null>(null);
  readonly project = computed(() => {
    const id = this.projectId();
    return id ? this.projectService.findById(id) : undefined;
  });
  readonly epics = signal<Epic[]>([]);
  readonly state = signal<ViewState>('loading');
  readonly searchTerm = signal('');

  readonly filteredEpics = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.epics();
    if (!term) return list;
    return list.filter(
      (epic) =>
        epic.title.toLowerCase().includes(term) ||
        epic.description?.toLowerCase().includes(term),
    );
  });

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');
    this.projectId.set(id);

    if (this.projectService.projects().length === 0) {
      this.projectService.getProjects().pipe(takeUntilDestroyed(this.Destrouref)).subscribe();
    }

    if (id) {
      this.GetAllEpics(id);
    } else {
      this.state.set('error');
    }
  }

  GetAllEpics(projectId: string): void {
    this.state.set('loading');
    this.projectService.getEpics(projectId).pipe(takeUntilDestroyed(this.Destrouref)).subscribe({
      next: (data) => {
        this.epics.set(data);
        this.state.set(data.length === 0 ? 'empty' : 'data');
      },
      error: () => {
        this.state.set('error');
      },
    });
  }

  retry(): void {
    const id = this.projectId();
    if (id) this.GetAllEpics(id);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
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