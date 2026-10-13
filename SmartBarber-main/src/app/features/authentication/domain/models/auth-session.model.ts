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