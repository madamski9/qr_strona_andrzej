import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SessionInfo {
  sessionId: string;
  status: 'active' | 'closed';
}

export interface UserResponseDto {
  userId: string;
  nickname: string;
  response: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class QrSessionService {
  private apiUrl = 'http://localhost:8080/api/qr';

  constructor(private http: HttpClient) {}

  createSession(sessionId: string): Observable<SessionInfo> {
    return this.http.post<SessionInfo>(`${this.apiUrl}/sessions`, { sessionId });
  }

  getSessionInfo(sessionId: string): Observable<SessionInfo> {
    return this.http.get<SessionInfo>(`${this.apiUrl}/sessions/${sessionId}`);
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
}
