import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { environment } from '../environments/environment';

export const firebaseApp = initializeApp(environment.firebase);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

export const ADMIN_EMAIL = 'admin@qr-andrzej.internal';
