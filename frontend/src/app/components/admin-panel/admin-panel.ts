import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QrSessionService, UserResponseDto } from '../../services/qr-session';
import { ThemeService } from '../../services/theme';

type SortKey = 'nickname' | 'response' | 'createdAt';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanelComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private qrService = inject(QrSessionService);
  private themeService = inject(ThemeService);

  sessionId = '';
  responses: UserResponseDto[] = [];
  sortKey: SortKey = 'createdAt';
  sortDirection: SortDirection = 'desc';
  showFilters = false;
  filterNickname = '';
  filterResponse = '';
  filterDate = '';
  questionText = '';
  isSavingQuestion = false;
  isResetting = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || 'default';
    this.loadSessionInfo();
    this.loadResponses();
  }

  loadSessionInfo() {
    this.qrService.getSessionInfo(this.sessionId).subscribe({
      next: (session) => {
        this.questionText = session.question || 'Wpisz swoją odpowiedź';
      },
      error: () => {
        this.questionText = 'Wpisz swoją odpowiedź';
      }
    });
  }

  saveQuestion() {
    this.isSavingQuestion = true;
    this.qrService.updateSessionQuestion(this.sessionId, this.questionText).subscribe({
      next: (session) => {
        this.questionText = session.question;
        this.successMessage = 'Pytanie zostało zapisane.';
        this.isSavingQuestion = false;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        console.error('Error saving question:', err);
        this.isSavingQuestion = false;
      }
    });
  }

  loadResponses() {
    this.qrService.getAllResponses(this.sessionId).subscribe({
      next: (data) => {
        this.responses = data;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error loading responses:', err);
        this.errorMessage = err?.message || 'Błąd podczas ładowania odpowiedzi';
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

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.filterNickname = '';
    this.filterResponse = '';
    this.filterDate = '';
  }

  get filteredResponses(): UserResponseDto[] {
    const nicknameFilter = this.filterNickname.trim().toLowerCase();
    const responseFilter = this.filterResponse.trim().toLowerCase();
    const dateFilter = this.filterDate.trim();

    return this.responses.filter((item) => {
      const createdAtDate = new Date(item.createdAt);
      const createdAtDay = Number.isNaN(createdAtDate.getTime())
        ? ''
        : createdAtDate.toISOString().slice(0, 10);

      const matchesNickname = !nicknameFilter || item.nickname.toLowerCase().includes(nicknameFilter);
      const matchesResponse = !responseFilter || item.response.toLowerCase().includes(responseFilter);
      const matchesDate = !dateFilter || createdAtDay === dateFilter;

      return matchesNickname && matchesResponse && matchesDate;
    });
  }

  get sortedResponses(): UserResponseDto[] {
    const sorted = [...this.filteredResponses];
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
        this.successMessage = 'Sesja została zresetowana pomyślnie.';
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
    this.qrService.logoutAdmin().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/'])
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  get isDarkTheme(): boolean {
    return this.themeService.theme === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
