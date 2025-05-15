import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  const accessToken = cookieService.get('accessToken');
  if (accessToken) return true;

  router.navigate(['/auth/login']);
  return false;
};
