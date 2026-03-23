import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  @Input() sessionId = 'default';

  private router = inject(Router);

  goToAdmin() {
    this.router.navigate([`/qr/${this.sessionId}/admin-login`]);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
