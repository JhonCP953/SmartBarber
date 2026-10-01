import {
    UserRole,
    UserStatus
} from '../../../../core/auth/model/auth-session.model';


export interface UserProfile {

    userId: string;
    firebaseUid: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: UserStatus;
    tenantId: string | null;
    photoUrl: string | null;
    clientId: string | null;
    barberId: string | null;
    barbershopId: string | null;
    barbershopName: string | null;
    document: string | null;
    documentType: string | null;
    name: string | null;
    cell: string | null;
}