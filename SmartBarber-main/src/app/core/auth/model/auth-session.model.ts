export type UserRole = 'CLIENT' | 'ADMIN' | 'BARBER';

export type UserStatus =
    | 'ACTIVE'
    | 'BLOCKED'
    | 'INACTIVE';

export interface AuthSession {
    userId: string;
    clientId: string | null;
    firebaseUid: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: UserStatus;
    tenantId: string | null;
    photoUrl: string | null;
    barberId: string | null;
    barbershopId: string | null;
}