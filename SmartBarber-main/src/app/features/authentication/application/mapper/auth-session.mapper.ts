import { User } from 'firebase/auth';

import {
    AuthSession,
    UserRole
} from '../../../../core/auth/model/auth-session.model';

import {
    BackendAuthenticationResponse,
    BackendRoleResponse
} from '../../domain/models/auth-session.model';

export function mapBackendAuthentication(
    response: BackendAuthenticationResponse,
    firebaseUser: User
): AuthSession {
    const role = mapRole(response.role);
    const userId = requireId(response.userId, 'userId');

    let clientId: string | null = null;
    let barberId: string | null = null;
    let barbershopId: string | null = null;

    if (role === 'CLIENT') {
        clientId = requireId(response.customerId, 'customerId');
    } else {
        barberId = requireId(response.employeeId, 'employeeId');
        barbershopId = requireId(response.barbershopId, 'barbershopId');
    }

    return {
        userId,
        clientId,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? '',
        role,
        status: 'ACTIVE',
        tenantId: barbershopId,
        photoUrl: firebaseUser.photoURL,
        barberId,
        barbershopId
    };
}

function mapRole(role: BackendRoleResponse): UserRole {
    switch (role) {
        case 'CUSTOMER':
        case 'Cliente':
            return 'CLIENT';
        case 'BARBER':
        case 'Barbero':
            return 'BARBER';
        case 'ADMIN':
        case 'Administrador':
            return 'ADMIN';
        default:
            throw new Error('INVALID_ROLE');
    }
}

function requireId(value: string | null | undefined, field: string): string {
    const id = value?.trim();

    if (!id) {
        throw new Error(`MISSING_AUTH_${field.toUpperCase()}`);
    }

    return id;
}
