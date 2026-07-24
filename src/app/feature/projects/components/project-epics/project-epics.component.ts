import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Epic, ViewState } from '../../../../core/models/project.model';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { SkeletonEpicComponent } from './components/skeleton-epic/skeleton-epic.component';
import { EpicEmptyStateComponent } from './components/epic-empty-state/epic-empty-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EpicDetailsComponent } from "../epic-details/epic-details.component";

@Component({
  selector: 'app-project-epics',
  standalone: true,
  imports: [RouterLink, DatePipe, ErrorStateComponent, SkeletonEpicComponent, EpicEmptyStateComponent, PaginationComponent, EpicDetailsComponent],
  templateUrl: './project-epics.component.html',
})
export class ProjectEpicsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly Destrouref = inject(DestroyRef);
  private readonly projectService = inject(ProjectService);
  readonly projectId = signal<string | null>(null);
      readonly selectedEpicId = signal<string | null>(null);
  readonly project = computed(() => {
    const id = this.projectId();
    return id ? this.projectService.findById(id) : undefined;
  });
  readonly epics = signal<Epic[]>([]);
  readonly state = signal<ViewState>('loading');
  readonly searchTerm = signal('');
  readonly pageSize = 6;
  readonly currentPage = signal(1);
  readonly totalItems = signal(0);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize)),
  );

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
 openEpic(epicId: string): void {
    this.selectedEpicId.set(epicId);
  }
  closeEpicModal(): void {
    this.selectedEpicId.set(null);
  }
  EpicUpdated(epic: Epic): void {
    this.epics.update((list) => list.map((e) => (e.id === epic.id ? epic : e)));
  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');
    this.projectId.set(id);

    if (this.projectService.projects().length === 0) {
      this.projectService.getProjects().pipe(takeUntilDestroyed(this.Destrouref)).subscribe();
    }

    if (id) {
      this.GetAllEpics(id,1);
    } else {
      this.state.set('error');
    }
  }

  GetAllEpics(projectId: string, page: number): void {
    this.state.set('loading');
    const offset = (page - 1) * this.pageSize;

    this.projectService
      .getEpics(projectId, this.pageSize, offset)
      .pipe(takeUntilDestroyed(this.Destrouref))
      .subscribe({
        next: ({ items, total }) => {
          this.epics.set(items);
          this.currentPage.set(page);
          this.totalItems.set(total);
          this.state.set(total === 0 ? 'empty' : 'data');
        },
        error: () => this.state.set('error'),
      });
  }

  onPageChange(page: number): void {
    const id = this.projectId();
    if (!id || page < 1) return;
    this.GetAllEpics(id, page);
  }

  retry(): void {
    const id = this.projectId();
    if (id) this.GetAllEpics(id, this.currentPage());
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  initials(name?: string ): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}