export interface Employee {

    id: string;

    userId: string;

    barberiaId: string;

    document: string;

    documentType: 'CC' | 'CE';

    name: string;

    cell: string;

    email: string;

    specialty: string;

    createAt: string;

    updateAt: string | null;
}