import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { QrSessionService } from '../services/qr-session';

@Injectable({
  providedIn: 'root'
})
export class SessionGuard {
  constructor(
    private router: Router,
    private sessionService: QrSessionService
  ) {}

  canActivate: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const sessionId = route.paramMap.get('sessionId');

    if (!sessionId) {
      this.router.navigate(['/']);
      return false;
    }

    try {
      const session = await this.sessionService.getSession(sessionId).toPromise();
      if (session && session.status === 'active') {
        return true;
      }

      alert('Sesja zakończona. Sesja została resetowana.');
      this.router.navigate(['/']);
      return false;
    } catch (error) {
      console.error('Błąd podczas sprawdzania sesji:', error);
      this.router.navigate(['/']);
      return false;
    }
  };
}
