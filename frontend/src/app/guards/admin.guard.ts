import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const adminToken = localStorage.getItem('adminToken');
    const sessionId = route.paramMap.get('sessionId');

    if (adminToken) {
      return true;
    }

    if (sessionId) {
      this.router.navigate([`/qr/${sessionId}/admin-login`]);
    } else {
      this.router.navigate(['/']);
    }

    return false;
  }
}
