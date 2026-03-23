import { Routes } from '@angular/router';
import { QrLoginComponent } from './components/qr-login/qr-login';
import { QrResponseComponent } from './components/qr-response/qr-response';

export const routes: Routes = [
  {
    path: 'qr/:sessionId',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: QrLoginComponent },
      { path: 'respond', component: QrResponseComponent }
    ]
  },
  { path: '', redirectTo: '/qr/default', pathMatch: 'full' }
];
