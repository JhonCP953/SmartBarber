import {
    AuthSession,
    UserRole,
    UserStatus
} from '../../../../core/auth/model/auth-session.model';

export type {
    AuthSession,
    UserRole,
    UserStatus
};


export interface AuthProfileResponse {

    userId: string;
    clientId?: string | null;
    firebaseUid: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: UserStatus;
    tenantId?: string | null;
    photoUrl?: string | null;
    barberId?: string | null;
    barbershopId?: string | null;
    barbershopName?: string | null;
}