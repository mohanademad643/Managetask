import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly create = output<void>();
   readonly title = input('No Projects');
    readonly description = input(' You don\'t have any projects yet. Start by defining your first architectural workspace to begin tracking tasks and epics.');
    readonly createLabel = input('Create New Project');
}