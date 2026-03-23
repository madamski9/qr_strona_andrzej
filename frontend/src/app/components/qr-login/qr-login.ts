import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QrSessionService } from '../../services/qr-session';

@Component({
  selector: 'app-qr-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-login.html',
  styleUrl: './qr-login.scss',
})
export class QrLoginComponent implements OnInit {
  nickname = '';
  sessionId = '';
  isLoading = false;
  error = '';

  constructor(
    private qrService: QrSessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || 'default';
  }

  submitNickname() {
    if (!this.nickname.trim()) {
      this.error = 'Proszę wpisać nick';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.qrService.submitNickname(this.sessionId, this.nickname).subscribe({
      next: (result) => {
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('nickname', this.nickname);
        this.router.navigate(['/qr', this.sessionId, 'respond']);
      },
      error: (err) => {
        // Obsługa błędu z interceptora
        if (err?.message) {
          this.error = err.message;
        } else {
          this.error = 'Błąd podczas logowania. Spróbuj ponownie.';
        }
        this.isLoading = false;
        console.error('Login error:', err);
      }
    });
  }
}
