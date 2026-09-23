export interface Employee {
    id: string;
    userId: string;
    barberiaId: string;
    document: string;
    documentType: string;
    name: string;
    cell: string;
    email: string;
    specialty: string;
    experienceYears: number;
    createAt: string;
    updateAt: string | null;
}