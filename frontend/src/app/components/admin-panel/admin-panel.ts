import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QrSessionService, UserResponseDto } from '../../services/qr-session';

type SortKey = 'nickname' | 'response' | 'createdAt';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanelComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private qrService = inject(QrSessionService);

  sessionId = '';
  responses: UserResponseDto[] = [];
  sortKey: SortKey = 'createdAt';
  sortDirection: SortDirection = 'desc';
  isResetting = false;
  successMessage = '';

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || 'default';
    this.loadResponses();
  }

  loadResponses() {
    this.qrService.getAllResponses(this.sessionId).subscribe({
      next: (data) => {
        this.responses = data;
      },
      error: (err) => {
        console.error('Error loading responses:', err);
      }
    });
  }

  sort(key: SortKey) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }

  get sortedResponses(): UserResponseDto[] {
    const sorted = [...this.responses];
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let aVal: any = a[this.sortKey];
      let bVal: any = b[this.sortKey];

      if (this.sortKey === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });

    return sorted;
  }

  resetSession() {
    if (!confirm('Czy na pewno chcesz resetować sesję? Wszystkie odpowiedzi zostaną usunięte!')) {
      return;
    }

    this.isResetting = true;
    this.qrService.resetSession(this.sessionId).subscribe({
      next: () => {
        this.responses = [];
        this.successMessage = '✅ Sesja resetowana pomyślnie!';
        this.isResetting = false;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        console.error('Error resetting session:', err);
        this.isResetting = false;
      }
    });
  }

  logout() {
    localStorage.removeItem('adminPassword');
    this.router.navigate([`/qr/${this.sessionId}/login`]);
  }

  goBack() {
    this.router.navigate([`/qr/${this.sessionId}/login`]);
  }
}
