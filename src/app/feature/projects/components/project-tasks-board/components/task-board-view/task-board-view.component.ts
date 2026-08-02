import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import {
  EpicTask,
  TaskDropEvent,
  TaskStatusConfig,
  ColumnData,
  DueStatus,
} from '../../../../../../core/models/project.model';


@Component({
  selector: 'app-task-board-view',
  standalone: true,
  imports: [RouterLink, DatePipe, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './task-board-view.component.html',
  styleUrl: './task-board-view.component.css',
})
export class TaskBoardViewComponent {
  readonly projectId = input.required<string>();
  readonly statuses = input.required<TaskStatusConfig[]>();
  readonly columns = input.required<ColumnData[]>();

  readonly taskDropped = output<TaskDropEvent>();

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

  onDrop(event: CdkDragDrop<EpicTask[]>, column: TaskStatusConfig): void {
    if (event.previousContainer === event.container) return;

    const task:EpicTask = event.item.data ;
    if (!task || task.status === column.status) return;

    this.taskDropped.emit({
      task,
      previousStatus: task.status,
      newStatus: column.status,
    });
  }
}