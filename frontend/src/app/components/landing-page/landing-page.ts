import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QrSessionService } from '../../services/qr-session';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPageComponent {
  private router = inject(Router);
  private qrService = inject(QrSessionService);

  nick = '';
  isLoading = false;
  errorMessage = '';

  submitNick(): void {
    if (!this.nick.trim()) {
      this.errorMessage = 'Wpisz swój nick';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    localStorage.setItem('userNick', this.nick);
    localStorage.setItem('nickname', this.nick);

    this.qrService.submitNickname('default', this.nick).subscribe({
      next: (response) => {
        localStorage.setItem('userId', response.userId);
        this.router.navigate(['/qr/default/respond']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.errorMessage = 'Błąd podczas wchodzenia na stronę';
        this.isLoading = false;
      }
    });
  }

  goToAdmin(): void {
    this.router.navigate(['/qr/default/admin-login']);
  }
}
