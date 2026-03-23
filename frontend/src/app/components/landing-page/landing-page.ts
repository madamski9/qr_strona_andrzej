import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPageComponent {
  private router = inject(Router);
  private http = inject(HttpClient);

  nick = '';
  isLoading = false;
  errorMessage = '';

  constructor() {
    console.log('✅ LandingPageComponent loaded');
  }

  submitNick(): void {
    if (!this.nick.trim()) {
      this.errorMessage = 'Wpisz swój nick';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    // Store nick in localStorage
    localStorage.setItem('userNick', this.nick);

    // Create user in backend with default session
    const createUserUrl = `${environment.apiUrl}/qr/sessions/default/login`;
    this.http.post<any>(createUserUrl, { nickname: this.nick }).subscribe(
      (response) => {
        // Store userId in localStorage
        localStorage.setItem('userId', response.userId);
        // Redirect to respond page
        this.router.navigate(['/qr/default/respond']);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error creating user:', error);
        this.errorMessage = 'Błąd podczas wchodzenia na stronę';
        this.isLoading = false;
      }
    );
  }

  goToAdmin(): void {
    // Navigate to admin login with default session
    this.router.navigate(['/qr/default/admin-login']);
  }
}
