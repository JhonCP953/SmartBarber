export type UserRole = 'CLIENT' | 'ADMIN';

export type UserStatus =
    | 'ACTIVE'
    | 'BLOCKED'
    | 'INACTIVE';

export interface AuthSession {
    userId: string;
    firebaseUid: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: UserStatus;
    tenantId: string | null;
    photoUrl: string | null;
}