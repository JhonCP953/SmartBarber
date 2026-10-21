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

 

export type BackendRole =
    | 'ADMIN'
    | 'BARBER'
    | 'CUSTOMER';


export type LegacyBackendRole =
    | 'Administrador'
    | 'Barbero'
    | 'Cliente';


export type BackendRoleResponse =
    | BackendRole
    | LegacyBackendRole;

export interface BackendAuthenticationResponse {
    role: BackendRoleResponse;
    userId: string;
    customerId?: string | null;
    employeeId?: string | null;
    barbershopId?: string | null;
}