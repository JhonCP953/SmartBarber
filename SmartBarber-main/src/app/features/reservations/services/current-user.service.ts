import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

/**
 * UID del usuario logueado en Firebase.
 * Al recargar la página, currentUser puede tardar en estar listo: se mantiene
 * sincronizado con onAuthStateChanged.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private lastUid: string = getAuth().currentUser?.uid ?? '';

  constructor() {
    onAuthStateChanged(getAuth(), user => {
      this.lastUid = user?.uid ?? '';
    });
  }

  get uid(): string {
    return getAuth().currentUser?.uid ?? this.lastUid;
  }
}
