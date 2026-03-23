import { Routes } from '@angular/router';
import { QrResponseComponent } from './components/qr-response/qr-response';
import { ResponseSavedComponent } from './components/response-saved/response-saved';
import { LandingPageComponent } from './components/landing-page/landing-page';
import { AdminLoginComponent } from './components/admin-login/admin-login';
import { AdminPanelComponent } from './components/admin-panel/admin-panel';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'qr/:sessionId',
    children: [
      { path: '', redirectTo: 'respond', pathMatch: 'full' },
      { path: 'login', redirectTo: '/', pathMatch: 'full' },
      {
        path: 'respond',
        component: QrResponseComponent,
        canActivate: []
      },
      { path: 'saved', component: ResponseSavedComponent },
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
