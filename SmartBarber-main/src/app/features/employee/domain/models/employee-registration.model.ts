export interface EmployeeRegistration {

    userId: string;

    barberiaId: string;

    document: string;

    documentType: 'CC' | 'CE';

    name: string;

    cell: string;

    email: string;

    specialty: string;
}