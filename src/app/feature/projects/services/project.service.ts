import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateEpicPayload, CreateTaskPayload, Epic, EpicTask, PagedResult, Project, ProjectMember, ProjectMemberResponse, Task, TaskStatus, UpdateEpicPayload } from '../../../core/models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rest/v1`;
  readonly projects = signal<Project[]>([]);

  readonly epics = signal<Epic[]>([]);

  findById(id: string): Project | undefined {
    return this.projects().find((p) => p.id === id);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/rpc/get_projects`).pipe(
      tap((data) => this.projects.set(data)),
    );
  }
  createProject(name: string, description: string): Observable<Project> {
    return this.http
      .post<Project>(`${this.baseUrl}/projects`, { name, description });
  }
  updateProject(
    id: string,
    name: string,
    description: string,
  ): Observable<Project> {
    return this.http
      .patch<Project>(`${environment.apiUrl}/rest/v1/projects?id=eq.${id}`, {
        name,
        description,
      })
      .pipe(
        tap(() => {
          this.projects.update((list) =>
            list.map((p) => (p.id === id ? { ...p, name, description } : p)),
          );
        }),
      );
  }
  getMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http
      .get<ProjectMemberResponse[]>(`${this.baseUrl}/get_project_members?project_id=eq.${projectId}`)
      .pipe(
        map((rows) =>
          rows.map((row) => ({
            id: row.user_id,
            name: row.metadata?.name ?? row.email,
            email: row.email,
            role: row.role,
            department: row.metadata?.department,
          })),
        ),
      );
  }

   getEpics(projectId: string, limit?: number, offset?: number): Observable<PagedResult<Epic>> {
     let params = new HttpParams();
  if (limit != null) params = params.set('limit', limit);
  if (offset != null) params = params.set('offset', offset);

  return this.http
    .get<Epic[]>(`${this.baseUrl}/project_epics?project_id=eq.${projectId}`, {
      params,
      headers: { Prefer: 'count=exact' },
      observe: 'response',
    })
      .pipe(
       map(({ body, headers }) => {
          const items = body ?? [];
          this.epics.set(items);
          const total = Number(headers.get('content-range')?.split('/')[1]) || items.length;
          return { items, total };
        }),
      );
  }

 createEpic(payload: CreateEpicPayload): Observable<Epic> {
    return this.http.post<Epic>(`${this.baseUrl}/epics`, payload).pipe(
      tap((epic) => this.epics.update((list) => [epic, ...list])),
    );
  }

  getEpicById(projectId: string, epicId: string): Observable<Epic> {
    return this.http
      .get<Epic[]>(`${this.baseUrl}/project_epics?project_id=eq.${projectId}&id=eq.${epicId}`)
      .pipe(
        map((rows) => rows[0]),
      );
  }
  
   updateEpic(epicId: string, payload: UpdateEpicPayload): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/epics?id=eq.${epicId}`, payload);
  }

  createTask(payload: CreateTaskPayload): Observable<Task> {
  return this.http.post<Task>(`${this.baseUrl}/tasks`, payload);
}

  getTasksByEpic(epicId: string): Observable<EpicTask[]> {
    return this.http.get<EpicTask[]>(`${this.baseUrl}/project_tasks?epic_id=eq.${epicId}`);
  }

  getTasksByStatus(projectId: string, status: TaskStatus): Observable<EpicTask[]> {
    const params = new HttpParams()
      .set('project_id', `eq.${projectId}`)
      .set('status', `eq.${status}`);
    return this.http.get<EpicTask[]>(`${this.baseUrl}/project_tasks`, { params });
  }

  updateTaskStatus(taskId: string, status: TaskStatus): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/tasks?id=eq.${taskId}`, { status });
  }
}