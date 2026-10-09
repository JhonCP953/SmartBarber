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
    | 'Cliente'
    | 'Barbero'
    | 'Administrador';