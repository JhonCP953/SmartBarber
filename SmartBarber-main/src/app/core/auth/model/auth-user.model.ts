export interface AuthUser {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
}