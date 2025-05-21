import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HeroService } from '../../hero/service/hero.service';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';

export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value ?? '';
    const valid = /^[a-zA-Z\s]+$/.test(value);
    return valid ? null : { invalidName: true };
  };
}

export function usernameValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return value && !/^[a-zA-Z0-9_]{3,20}$/.test(value)
      ? { invalidUsername: true }
      : null;
  };
}

export function strongPasswordValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return value && !regex.test(value) ? { weakPassword: true } : null;
  };
}

export function ageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value ?? 0);
    return value >= 1 && value <= 150 ? null : { invalidAge: true };
  };
}

export function emailExistsValidator(service: any): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value;
    const originalEmail = control.parent?.get('originalEmail')?.value;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return of(null);
    }

    // If email hasn't changed, don't validate
    if (email === originalEmail) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() => service.checkEmailExists(email)),
      map(exists => exists ? { emailExists: true } : null),
      catchError(() => of(null))
    );
  };
}
