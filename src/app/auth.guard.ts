import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access-token');

  if (token) {
    return true;
  } else {
    alert('Access denied! Please log in first.');
    return router.createUrlTree(['/login']);
  }
};
