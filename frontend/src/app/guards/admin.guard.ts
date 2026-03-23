import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  constructor(private router: Router) {}

  canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const adminPassword = localStorage.getItem('adminPassword');
    const sessionId = route.paramMap.get('sessionId');

    if (adminPassword) {
      return true;
    }

    if (sessionId) {
      this.router.navigate([`/qr/${sessionId}/admin-login`]);
    } else {
      this.router.navigate(['/']);
    }

    return false;
  };
}
