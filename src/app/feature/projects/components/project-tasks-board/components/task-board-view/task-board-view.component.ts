import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TaskStatusConfig, ColumnData } from '../../../../../../core/models/project.model';
type DueStatus = 'overdue' | 'today' | 'upcoming';



@Component({
  selector: 'app-task-board-view',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './task-board-view.component.html',
  styleUrl: './task-board-view.component.css',
})
export class TaskBoardViewComponent {
  readonly projectId = input.required<string>();
  readonly statuses = input.required<TaskStatusConfig[]>();
  readonly columns = input.required<ColumnData[]>();


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

  dueDateStatus(dueDate?: string): DueStatus | null {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    if (due.getTime() < today.getTime()) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  }


}