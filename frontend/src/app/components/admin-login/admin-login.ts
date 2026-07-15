import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QrSessionService } from '../../services/qr-session';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLoginComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private qrService = inject(QrSessionService);

  password = '';
  isLoading = false;
  errorMessage = '';
  sessionId = '';

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || 'default';
  }

  submitPassword(): void {
    if (!this.password.trim()) {
      this.errorMessage = 'Wpisz hasło';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.qrService.loginAdmin(this.password).subscribe({
      next: () => {
        this.router.navigate([`/qr/${this.sessionId}/admin`]);
      },
      error: () => {
        this.errorMessage = 'Nieprawidlowe haslo';
        this.password = '';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
