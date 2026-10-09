import {
  DocumentType
} from '../../../barber-shop/domain/models/barber-shop.model';

export interface AdminRegistrationForm {

  name: string;

  document: string;

  documentType: DocumentType;

  cell: string;
}

export interface CreateUserRequest {

  roleId: 4;
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

export interface AdminRegistrationResult {

  userId: string;

  employeeId: string;

  barberShopId: string;

  message: string;
}