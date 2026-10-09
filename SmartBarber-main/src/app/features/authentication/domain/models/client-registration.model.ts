export type DocumentType =
    | 'CC'
    | 'CE'
    | 'NIT';

export interface ClientRegistrationForm {

    document: string;

    documentType: DocumentType;

    name: string;

    cell: string;
}

export interface CreateUserRequest {

    roleId: 1;
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

export interface ClientRegistrationResult {

    userId: string;

    clientId: string;

    message: string;
}