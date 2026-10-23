import {
    DocumentType
} from '../../../barber-shop/domain/models/barber-shop.model';


/*
 * =========================================================
 * FORMULARIO ADMINISTRADOR
 * =========================================================
 */

export interface AdminRegistrationForm {

    name: string;

    document: string;

    documentType: DocumentType;

    cell: string;

}


export interface CreateUserRequest {

    roleId: number;

}


export interface CreateUserResponse {

    id?: string;

    userId?: string;

    firebaseId?: string;

    status?: string;

    createAt?: string;

    updateAt?: string | null;

    roleId?: number;

}


export interface CreateAdminRequest {

    userId: string;

    barberiaId: string;

    name: string;

    document: string;

    documentType: DocumentType;

    cell: string;

    email: string;

    specialty: string;

}


export interface CreateAdminResponse {

    id?: string;

    adminId?: string;

    userId?: string;

    barberiaId?: string;

    document?: string;

    documentType?: DocumentType;

    name?: string;

    cell?: string;

    email?: string;

    specialty?: string;

    createAt?: string;

    updateAt?: string | null;

    message?: string;

}


/*
 * =========================================================
 * ONBOARDING BARBERÍA
 * =========================================================
 */

export interface BarberShopOnboardingRequest {

    name: string;

    description: string;

    location: string;

    phone: string;

    document: string;

    documentType: DocumentType;

    companyName: string;

    employee: {

        user: {

            roleId: number;

        };


        barberiaId: string;

        name: string;

        document: string;

        documentType: DocumentType;

        cell: string;

        email: string;

        specialty: string;

    };

}


/*
 * =========================================================
 * USER RESPONSE
 * =========================================================
 */

export interface BarberShopOnboardingUserResponse {

    id: string;

    firebaseId: string;

    status: string;

    roleId: number;

    createAt: string;

}


/*
 * =========================================================
 * EMPLOYEE RESPONSE
 * =========================================================
 */

export interface BarberShopOnboardingEmployeeResponse {

    id: string;

    name: string;

    document: string;

    documentType: DocumentType;

    cell: string;

    email: string;

    specialty: string;

    user: BarberShopOnboardingUserResponse;

    createAt: string | null;

}


/*
 * =========================================================
 * RESPONSE ONBOARDING BARBERÍA
 * =========================================================
 */

export interface BarberShopOnboardingResponse {

    id: string;

    name: string;

    description: string;

    location: string;

    phone: string;

    document: string;

    documentType: DocumentType;

    companyName: string | null;

    employee:
        BarberShopOnboardingEmployeeResponse;

}


/*
 * =========================================================
 * RESULTADO DEL USE CASE
 * =========================================================
 */

export interface AdminRegistrationResult {

    userId: string;

    employeeId: string;

    barberShopId: string;

    message: string;

}