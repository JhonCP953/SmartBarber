import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { BehaviorSubject, Observable } from 'rxjs';

import { firebaseConfig } from '../../../../environments/firebase.config';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {

  private readonly firebaseApp = initializeApp(firebaseConfig);

  private readonly auth: Auth = getAuth(this.firebaseApp);

  private readonly userSubject =
    new BehaviorSubject<User | null>(this.auth.currentUser);

  readonly user$: Observable<User | null> =
    this.userSubject.asObservable();

  constructor() {
    // Keep the application informed whenever Firebase changes
    // the current authentication state.
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();

    // Request the user's basic Google profile information.
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(this.auth, provider);

    this.userSubject.next(result.user);

    return result.user;
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;

    if (!user) {
      return null;
    }

    return user.getIdToken();
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.userSubject.next(null);
  }
}