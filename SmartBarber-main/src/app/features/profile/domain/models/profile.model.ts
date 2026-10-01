export type DocumentType =
    | 'CC'
    | 'CE'
    | 'NIT'
    | string;


export interface ClientProfile {

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


export interface UpdateProfileRequest {

    userId: string;
    document: string;
    documentType: DocumentType;
    name: string;
    cell: string;
    email: string;
}