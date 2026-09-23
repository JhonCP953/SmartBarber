export interface AdminRegistrationForm {
    name: string;
    cell: string;
}

export interface CreateAdminRequest {
    userId: string;
    name: string;
    cell: string;
    email: string;
}

export interface CreateAdminResponse {
    id?: string;
    adminId?: string;
    userId?: string;
    message?: string;
}

export interface AdminRegistrationResult {
    userId: string;
    adminId?: string;
    message?: string;
}