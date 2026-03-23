import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-response-saved',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './response-saved.html',
  styleUrl: './response-saved.scss',
})
export class ResponseSavedComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sessionId = 'default';

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || 'default';
  }

  goBackToForm() {
    this.router.navigate([`/qr/${this.sessionId}/respond`]);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
