export interface EmployeeRegistration {

    user: {
        roleId: number;
    };

    barberiaId: string;

    document: string;

    documentType: 'CC' | 'CE';

    name: string;

    cell: string;

    email: string;

    specialty: string;
}

export interface EmployeeRegistrationResponse {

    id: string;

    user: {
        id: string;
        firebaseId: string;
        status: string;
        roleId: number;
        createAt: string;
    };

    barberiaId: string;

    document: string;

    documentType: 'CC' | 'CE';

    name: string;

    cell: string;

    email: string;

    specialty: string;

    createAt: string;

    updateAt?: string | null;
}