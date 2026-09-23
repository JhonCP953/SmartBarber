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
    firebaseUid: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: UserStatus;
    tenantId?: string | null;
    photoUrl?: string | null;
}