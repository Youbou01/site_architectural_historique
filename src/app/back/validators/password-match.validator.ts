import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function PasswordMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  };
}
