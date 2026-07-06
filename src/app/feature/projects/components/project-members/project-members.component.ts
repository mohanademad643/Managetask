import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ProjectMember, ViewState } from '../../../../core/models/project.model';
import { SkeletonMemberComponent } from "./components/skeleton-member/skeleton-member.component";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [
    RouterLink,
    ErrorStateComponent,
    EmptyStateComponent,
    SkeletonMemberComponent
],
  templateUrl: './project-members.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMembersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectServ = inject(ProjectService);
  private readonly ref = inject(DestroyRef);
  readonly state = signal<ViewState>('loading');
  readonly members = signal<ProjectMember[]>([]);
  readonly projectId = signal<string | null>(null);

  readonly projectName = computed(() => {
    const id = this.projectId();
    return id ? (this.projectServ.findById(id)?.name ?? '') : '';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
      if (this.projectServ.projects().length === 0) {
    this.projectServ.getProjects().pipe(takeUntilDestroyed(this.ref)).subscribe({
      error: () => {}, 
    });
  }

    this.projectId.set(id);
    this.loadMembers();
  }

  loadMembers(): void {
    const id = this.projectId();
    if (!id) {
      this.state.set('error');
      return;
    }

    this.projectServ.getMembers(id).pipe(takeUntilDestroyed(this.ref)).subscribe({
      next: (data) => {
        this.members.set(data);
        this.state.set(data.length === 0 ? 'empty' : 'data');
      },
      error: () => this.state.set('error'),
    });
  }


  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

}