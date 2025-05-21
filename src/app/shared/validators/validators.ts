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

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value ?? '';
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return valid ? null : { invalidEmail: true };
  };
}

export function ageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = Number(control.value ?? 0);
    return value >= 1 && value <= 150 ? null : { invalidAge: true };
  };
}

export function emailExistsValidator(heroService: HeroService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {

    const email = control.value;
    if (!email) return of(null);

    return timer(300).pipe( // debounce tránh spam API
      switchMap(() =>
        heroService.checkEmailExists(email).pipe(
          map(exists => (exists ? { emailExists: true } : null)),
          catchError(() => of(null)) // nếu API lỗi thì bỏ qua validate
        )
      )
    );
  };
}