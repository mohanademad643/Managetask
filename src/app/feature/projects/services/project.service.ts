import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Project } from '../../../core/models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rest/v1`;
  readonly projects = signal<Project[]>([]);
  findById(id: string): Project | undefined {
    return this.projects().find((p) => p.id === id);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/rpc/get_projects`).pipe(
      tap((data) => this.projects.set(data)),
      catchError((err) => {
        const status = err?.status;
        if (status === 401) return throwError(() => ({ type: 'unauthorized' }));
        return throwError(() => ({ type: 'error' }));
      }),
    );
  }
  createProject(name: string, description: string): Observable<Project> {
    return this.http
      .post<Project>(`${this.baseUrl}/projects`, { name, description })
      .pipe(
        catchError((err) => {
          const status = err?.status;
          if (status === 401)
            return throwError(() => ({ type: 'unauthorized' }));
          return throwError(() => ({ type: 'error' }));
        }),
      );
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
        catchError((err) =>
          throwError(() => err.error?.msg ?? 'Failed to load user data.'),
        ),
      );
  }
}
