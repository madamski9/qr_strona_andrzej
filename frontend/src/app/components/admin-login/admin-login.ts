import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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

  password = '';
  isLoading = false;
  errorMessage = '';
  sessionId = '';

  private ADMIN_PASSWORD = 'admin123'; // TODO: Change in production

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

    // Symulacja sprawdzenia hasła
    setTimeout(() => {
      if (this.password === this.ADMIN_PASSWORD) {
        localStorage.setItem('adminPassword', this.password);
        this.router.navigate([`/qr/${this.sessionId}/admin`]);
      } else {
        this.errorMessage = 'Nieprawidłowe hasło';
        this.password = '';
        this.isLoading = false;
      }
    }, 300);
  }

  goBack(): void {
    this.router.navigate([`/qr/${this.sessionId}/login`]);
  }
}
