import { Routes } from '@angular/router';
import { QrLoginComponent } from './components/qr-login/qr-login';
import { QrResponseComponent } from './components/qr-response/qr-response';
import { LandingPageComponent } from './components/landing-page/landing-page';
import { AdminLoginComponent } from './components/admin-login/admin-login';
import { AdminPanelComponent } from './components/admin-panel/admin-panel';
import { AuthGuard } from './guards/auth.guard';
import { SessionGuard } from './guards/session.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'qr/:sessionId',
    canActivate: [SessionGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: QrLoginComponent },
      {
        path: 'respond',
        component: QrResponseComponent,
        canActivate: [AuthGuard]
      },
      { path: 'admin-login', component: AdminLoginComponent },
      {
        path: 'admin',
        component: AdminPanelComponent,
        canActivate: [AdminGuard]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
