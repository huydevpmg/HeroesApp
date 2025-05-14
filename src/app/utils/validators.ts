import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /^[a-zA-Z\s]+$/.test(control.value);
    return valid ? null : { invalidName: true };
  };
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value);
    return valid ? null : { invalidEmail: true };
  };
}

export function ageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value);
    return value >= 1 && value <= 150 ? null : { invalidAge: true };
  };
}
