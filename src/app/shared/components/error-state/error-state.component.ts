import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  templateUrl: './error-state.component.html',
})
export class ErrorStateComponent {
  readonly title = input('Something went wrong');
  readonly description = input(
    "We're having trouble retrieving your projects right now. Please try again in a moment.",
  );
  readonly retryLabel = input('Retry Connection');
  readonly retry = output<void>();
}
