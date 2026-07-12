import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Project, ViewState } from '../../../../core/models/project.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ProjectService } from '../../services/project.service';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SkeletonCardComponent } from './components/skeleton-card/skeleton-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    DatePipe,
    ErrorStateComponent,
    EmptyStateComponent,
    PaginationComponent,
    SkeletonCardComponent,
    RouterLink,
  ],
  templateUrl: './projects-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent implements OnInit {
  private readonly projectServ = inject(ProjectService);
  private readonly ref = inject(DestroyRef);
  private readonly router = inject(Router);
  PageSize = signal<number>(6).asReadonly();
  readonly state = signal<ViewState>('loading');
  readonly projects = signal<Project[]>([]);
  readonly currentPage = signal(1);

  readonly totalPages = computed(() =>
    Math.ceil(this.projects().length / this.PageSize()),
  );

  readonly pagedProjects = computed(() => {
    const start = (this.currentPage() - 1) * this.PageSize();
    return this.projects().slice(start, start + this.PageSize());
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.state.set('loading');

    this.projectServ.getProjects().pipe(takeUntilDestroyed(this.ref)).subscribe({
      next: (data) => {
        this.projects.set(data);
        this.currentPage.set(1);
        this.state.set(data.length === 0 ? 'empty' : 'data');
      },
      error: (err) => {
        if (err?.type === 'unauthorized')
          this.router.navigateByUrl('/auth/login');
        else this.state.set('error');
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToCreate(): void {
    this.router.navigateByUrl('/project/add');
  }
}
