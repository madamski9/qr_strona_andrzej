import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

function waitForAuthUser(): Promise<boolean> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user !== null);
    });
  });
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const isAdmin = await waitForAuthUser();
    if (isAdmin) {
      return true;
    }

    const sessionId = route.paramMap.get('sessionId');
    if (sessionId) {
      this.router.navigate([`/qr/${sessionId}/admin-login`]);
    } else {
      this.router.navigate(['/']);
    }

    return false;
  }
}
