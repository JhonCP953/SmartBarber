export type ManagedUserStatus =
    | 'ACTIVE'
    | 'BLOCKED'
    | 'INACTIVE'
    | string;


export type ManagedUserRole =
    | 'CLIENT'
    | 'BARBER'
    | 'ADMIN'
    | string;


export interface ManagedUser {

    id: string;

    firebaseId: string;

    status: ManagedUserStatus;

    createAt: string | null;

    updateAt: string | null;

    role: ManagedUserRole | null;

    name: string | null;

    email: string | null;

    cell: string | null;
}


export interface UpdateUserStatusRequest {

    firebaseId: string;

    status: string;

    reason: string;
}


export interface UserSearchRequest {

    userId: string;
}


export interface UserManagementState {

    users: ManagedUser[];

    selectedUser: ManagedUser | null;

    loading: boolean;

    searching: boolean;

    blocking: boolean;

    errorMessage: string;

    successMessage: string;
}