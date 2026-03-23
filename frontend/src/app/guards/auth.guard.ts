import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private router: Router) {}

  canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const userId = localStorage.getItem('userId');
    const sessionId = route.paramMap.get('sessionId');

    if (userId && sessionId) {
      return true;
    }

    if (sessionId) {
      this.router.navigate([`/qr/${sessionId}/login`]);
    } else {
      this.router.navigate(['/']);
    }

    return false;
  };
}
