import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DueStatus, EpicTask, TASK_STATUS_CONFIGS } from '../../../../../../core/models/project.model';
import { RouterLink } from '@angular/router';



@Component({
  selector: 'app-task-list-view',
  standalone: true,
  imports: [DatePipe,RouterLink],
  templateUrl: './task-list-view.component.html'
})
export class TaskListViewComponent {
  readonly projectId = input.required<string>();
  readonly tasks = input.required<EpicTask[]>();


  initials(name?: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

    statusConfig(status: EpicTask['status']) {
      return TASK_STATUS_CONFIGS.find((s) => s.status === status);
    }
  taskDueStatus(dueDate?: string): DueStatus | null {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    const today = new Date();

    if (due.getTime() < today.getTime()) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  }
 
}