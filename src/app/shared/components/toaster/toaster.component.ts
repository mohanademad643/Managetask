import { Component, inject } from '@angular/core';
import { ToastType } from '../../../core/models/toast.model';
import { ToastService } from '../../services/toster.service';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [],
  templateUrl: './toaster.component.html'
})
export class ToasterComponent  {
  private readonly toastServ = inject(ToastService);
  readonly toasts = this.toastServ.toasts;
 
  dismiss(id: number): void {
    this.toastServ.dismiss(id);
  }
 
  iconPath(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'M4.5 12.75l6 6 9-13.5';
      case 'error':
        return 'M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z';
      default:
        return 'M11.25 11.25h.375a.375.375 0 0 1 .375.375v4.125m-1.5 0h1.875M12 6.75h.008v.008H12V6.75Z';
    }
  }
 
  accentClass(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'border-[var(--color-success)] text-[var(--color-surface)] bg-[var(--color-success)]';
      case 'error':
        return 'border-[var(--color-error)] text-[var(--color-surface)] bg-[var(--color-error)]';
      default:
        return 'border-[var(--color-primary-container)] text-[var(--color-surface)] bg-[var(--color-primary-container)]';
    }
  }
}