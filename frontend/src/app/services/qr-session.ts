import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SessionInfo {
  sessionId: string;
  status: 'active' | 'closed';
  question: string;
}

export interface UserResponseDto {
  userId: string;
  nickname: string;
  response: string;
  createdAt: Date;
}

export interface AdminLoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class QrSessionService {
  private apiUrl = `${environment.apiUrl}/qr`;

  constructor(private http: HttpClient) {}

  createSession(sessionId: string): Observable<SessionInfo> {
    return this.http.post<SessionInfo>(`${this.apiUrl}/sessions`, { sessionId });
  }

  getSessionInfo(sessionId: string): Observable<SessionInfo> {
    return this.http.get<SessionInfo>(`${this.apiUrl}/sessions/${sessionId}`);
  }

  loginAdmin(password: string): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${this.apiUrl}/admin/login`, { password });
  }

  logoutAdmin(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/logout`, {}, this.getAdminHttpOptions());
  }

  updateSessionQuestion(sessionId: string, question: string): Observable<SessionInfo> {
    return this.http.put<SessionInfo>(
      `${this.apiUrl}/sessions/${sessionId}/question`,
      { question },
      this.getAdminHttpOptions()
    );
  }

  submitNickname(sessionId: string, nickname: string): Observable<{ userId: string }> {
    return this.http.post<{ userId: string }>(`${this.apiUrl}/sessions/${sessionId}/login`, { nickname });
  }

  submitResponse(sessionId: string, userId: string, response: string): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.apiUrl}/sessions/${sessionId}/response`, { userId, response });
  }

  getUserResponses(sessionId: string, userId: string): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/sessions/${sessionId}/user/${userId}`);
  }

  getSession(sessionId: string): Observable<SessionInfo> {
    return this.http.get<SessionInfo>(`${this.apiUrl}/sessions/${sessionId}`);
  }

  getAllResponses(sessionId: string): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/sessions/${sessionId}/responses`, this.getAdminHttpOptions());
  }

  resetSession(sessionId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sessions/${sessionId}/reset`, {}, this.getAdminHttpOptions());
  }

  private getAdminHttpOptions() {
    const token = localStorage.getItem('adminToken') || '';
    const headers = new HttpHeaders({
      'X-Admin-Token': token
    });
    return { headers };
  }
}
