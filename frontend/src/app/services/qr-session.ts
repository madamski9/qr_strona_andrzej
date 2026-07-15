import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  collectionGroup,
  writeBatch,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth, ADMIN_EMAIL } from '../firebase';

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

const DEFAULT_QUESTION = 'Wpisz swoją odpowiedź';

@Injectable({
  providedIn: 'root',
})
export class QrSessionService {
  createSession(sessionId: string): Observable<SessionInfo> {
    return from(this.createOrGetSession(sessionId));
  }

  getSessionInfo(sessionId: string): Observable<SessionInfo> {
    return from(this.fetchSession(sessionId));
  }

  getSession(sessionId: string): Observable<SessionInfo> {
    return this.getSessionInfo(sessionId);
  }

  loginAdmin(password: string): Observable<void> {
    return from(signInWithEmailAndPassword(auth, ADMIN_EMAIL, password).then(() => undefined));
  }

  logoutAdmin(): Observable<void> {
    return from(signOut(auth));
  }

  updateSessionQuestion(sessionId: string, question: string): Observable<SessionInfo> {
    return from(this.doUpdateSessionQuestion(sessionId, question));
  }

  submitNickname(sessionId: string, nickname: string): Observable<{ userId: string }> {
    return from(this.doSubmitNickname(sessionId, nickname));
  }

  submitResponse(sessionId: string, userId: string, response: string): Observable<UserResponseDto> {
    return from(this.doSubmitResponse(sessionId, userId, response));
  }

  getUserResponses(sessionId: string, userId: string): Observable<UserResponseDto[]> {
    return from(this.fetchUserResponses(sessionId, userId));
  }

  getAllResponses(sessionId: string): Observable<UserResponseDto[]> {
    return from(this.fetchAllResponses(sessionId));
  }

  resetSession(sessionId: string): Observable<void> {
    return from(this.doResetSession(sessionId));
  }

  private async createOrGetSession(sessionId: string): Promise<SessionInfo> {
    const ref = doc(db, 'sessions', sessionId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return this.toSessionInfo(sessionId, snap.data());
    }

    await setDoc(ref, {
      sessionId,
      status: 'active',
      question: DEFAULT_QUESTION,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { sessionId, status: 'active', question: DEFAULT_QUESTION };
  }

  private async fetchSession(sessionId: string): Promise<SessionInfo> {
    const ref = doc(db, 'sessions', sessionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return this.toSessionInfo(sessionId, snap.data());
  }

  private async doUpdateSessionQuestion(sessionId: string, question: string): Promise<SessionInfo> {
    await this.createOrGetSession(sessionId);
    const nextQuestion = question?.trim() ? question.trim() : DEFAULT_QUESTION;
    await updateDoc(doc(db, 'sessions', sessionId), {
      question: nextQuestion,
      updatedAt: serverTimestamp(),
    });
    return this.fetchSession(sessionId);
  }

  private async doSubmitNickname(sessionId: string, nickname: string): Promise<{ userId: string }> {
    await this.createOrGetSession(sessionId);
    const usersRef = collection(db, 'sessions', sessionId, 'users');
    const userDoc = await addDoc(usersRef, {
      sessionId,
      nickname,
      createdAt: serverTimestamp(),
    });
    return { userId: userDoc.id };
  }

  private async doSubmitResponse(sessionId: string, userId: string, responseText: string): Promise<UserResponseDto> {
    const userRef = doc(db, 'sessions', sessionId, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error(`User not found: ${userId}`);
    }
    const nickname = userSnap.data()['nickname'] as string;

    const responsesRef = collection(db, 'sessions', sessionId, 'users', userId, 'responses');
    const now = new Date();
    await addDoc(responsesRef, {
      sessionId,
      userId,
      nickname,
      response: responseText,
      createdAt: serverTimestamp(),
    });

    return { userId, nickname, response: responseText, createdAt: now };
  }

  private async fetchUserResponses(sessionId: string, userId: string): Promise<UserResponseDto[]> {
    const responsesRef = collection(db, 'sessions', sessionId, 'users', userId, 'responses');
    const snap = await getDocs(responsesRef);
    return snap.docs.map((d) => this.toUserResponseDto(d.data())).sort(byCreatedAtAsc);
  }

  private async fetchAllResponses(sessionId: string): Promise<UserResponseDto[]> {
    const q = query(collectionGroup(db, 'responses'), where('sessionId', '==', sessionId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.toUserResponseDto(d.data())).sort(byCreatedAtAsc);
  }

  private async doResetSession(sessionId: string): Promise<void> {
    const usersRef = collection(db, 'sessions', sessionId, 'users');
    const usersSnap = await getDocs(usersRef);

    const batch = writeBatch(db);
    for (const userDoc of usersSnap.docs) {
      const responsesSnap = await getDocs(
        collection(db, 'sessions', sessionId, 'users', userDoc.id, 'responses')
      );
      responsesSnap.docs.forEach((r) => batch.delete(r.ref));
      batch.delete(userDoc.ref);
    }
    batch.update(doc(db, 'sessions', sessionId), { status: 'closed', updatedAt: serverTimestamp() });
    await batch.commit();
  }

  private toSessionInfo(sessionId: string, data: DocumentData): SessionInfo {
    return {
      sessionId,
      status: data['status'] ?? 'active',
      question: data['question'] ?? DEFAULT_QUESTION,
    };
  }

  private toUserResponseDto(data: DocumentData): UserResponseDto {
    return {
      userId: data['userId'],
      nickname: data['nickname'],
      response: data['response'],
      createdAt: data['createdAt']?.toDate?.() ?? new Date(),
    };
  }
}

function byCreatedAtAsc(a: UserResponseDto, b: UserResponseDto): number {
  return a.createdAt.getTime() - b.createdAt.getTime();
}
