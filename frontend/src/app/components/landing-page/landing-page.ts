import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPageComponent {
  private router = inject(Router);

  sessionId = '';
  isLoading = false;
  errorMessage = '';

  constructor() {
    console.log('✅ LandingPageComponent loaded');
  }

  submitSessionId(): void {
    if (!this.sessionId.trim()) {
      this.errorMessage = 'Wpisz kod sesji';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    // Redirect to login page
    setTimeout(() => {
      this.router.navigate([`/qr/${this.sessionId}/login`]);
      this.isLoading = false;
    }, 300);
  }
}
