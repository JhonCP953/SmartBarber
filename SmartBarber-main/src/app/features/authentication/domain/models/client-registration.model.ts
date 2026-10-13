export type DocumentType =
    | 'CC'
    | 'CE'
    | 'NIT';


/*
 * =========================================================
 * FORMULARIO DEL FRONT
 * =========================================================
 */

export interface ClientRegistrationForm {

    document: string;

    documentType: DocumentType;

    name: string;

    cell: string;
}

export interface CreateUserRequest {

    roleId: number;
}


export interface CreateUserResponse {

    id: string;

    firebaseId: string;

    status: string;

    createAt: string;

    updateAt: string | null;

    roleId: number;
}


export interface CreateClientRequest {

    userId: string;

    name: string;

    document: string;

    documentType: DocumentType;

    cell: string;

    email: string;
}


export interface CreateClientResponse {

    id: string;

    userId: string;

    document: string;

    documentType: DocumentType;

    name: string;

    cell: string;

    email: string;

    createAt: string;

    updateAt: string | null;
}


/*
 * =========================================================
 * ONBOARDING CLIENTE
 * =========================================================
 */

export interface CustomerOnboardingRequest {

    user: {

        roleId: number;

    };

    name: string;

    document: string;

    documentType: DocumentType;

    cell: string;

    email: string;
}


/*
 * =========================================================
 * RESPONSE USER
 * =========================================================
 */

export interface CustomerOnboardingUserResponse {

    id: string;

    firebaseId: string;

    status: string;

    roleId: number;

    createAt: string;

}


/*
 * =========================================================
 * RESPONSE ONBOARDING CLIENTE
 * =========================================================
 */

export interface CustomerOnboardingResponse {

    id: string;

    user: CustomerOnboardingUserResponse;

    document: string;

    documentType: DocumentType;

    name: string;

    cell: string;

    email: string;

    createAt: string;

    updateAt: string | null;
}


/*
 * =========================================================
 * RESULTADO DEL USE CASE
 * =========================================================
 */

export interface ClientRegistrationResult {

    userId: string;

    clientId: string;

    message: string;
}