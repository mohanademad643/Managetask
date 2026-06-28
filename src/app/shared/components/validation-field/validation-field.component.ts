import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

export interface FieldValidation {
  name: string;
  msg: string;
}

export interface PatternRule {
  label: string;
  errorKey: string;
}

@Component({
  selector: 'app-validation-field',
  standalone: true,
  templateUrl: './validation-field.component.html',
})
export class ValidationFieldComponent {
  readonly fieldControl = input.required<AbstractControl>();
  readonly label = input<{ value: string; for: string }>({
    value: '',
    for: '',
  });
  readonly validations = input<FieldValidation[]>([]);
  readonly patternRules = input<PatternRule[]>([]);

  isRuleMet(errorKey: string): boolean {
    const ctrl = this.fieldControl();
    if (!ctrl.value) return false;
    return !ctrl.hasError(errorKey);
  }
}
