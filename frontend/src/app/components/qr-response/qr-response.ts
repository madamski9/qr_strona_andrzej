import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QrSessionService, UserResponseDto } from '../../services/qr-session';

@Component({
  selector: 'app-qr-response',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-response.html',
  styleUrl: './qr-response.scss',
})
export class QrResponseComponent implements OnInit {
  nickname = '';
  sessionId = '';
  userId = '';
  responseText = '';
  isLoading = false;
  isSubmitting = false;
  error = '';
  success = false;
  currentQuestion = 'Wpisz swoją odpowiedź';
  userResponses: UserResponseDto[] = [];

  constructor(
    private qrService: QrSessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || 'default';
    this.userId = localStorage.getItem('userId') || '';
    this.nickname = localStorage.getItem('nickname') || '';

    if (!this.userId) {
      window.location.href = '/';
      return;
    }

    this.loadResponses();
    this.loadQuestion();
  }

  loadQuestion() {
    this.qrService.getSessionInfo(this.sessionId).subscribe({
      next: (session) => {
        this.currentQuestion = session.question || 'Wpisz swoją odpowiedź';
      },
      error: () => {
        this.currentQuestion = 'Wpisz swoją odpowiedź';
      }
    });
  }

  loadResponses() {
    this.isLoading = true;
    this.qrService.getUserResponses(this.sessionId, this.userId).subscribe({
      next: (responses) => {
        this.userResponses = responses;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading responses:', err);
        this.error = err?.message || 'Błąd podczas ładowania odpowiedzi';
        this.isLoading = false;
      }
    });
  }

  submitResponse() {
    if (!this.responseText.trim()) {
      this.error = 'Proszę wpisać odpowiedź';
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.success = false;

    this.qrService.submitResponse(this.sessionId, this.userId, this.responseText).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate([`/qr/${this.sessionId}/saved`]);
      },
      error: (err) => {
        this.error = err?.message || 'Błąd podczas wysyłania odpowiedzi. Spróbuj ponownie.';
        this.isSubmitting = false;
        console.error('Submit error:', err);
      }
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '/';
  }
}
