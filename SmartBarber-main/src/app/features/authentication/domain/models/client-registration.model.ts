export interface ClientRegistrationForm {
  document: string;
  documentType: string;
  name: string;
  cell: string;
}

export interface CreateUserRequest {
  firebaseId: string;
}

export interface CreateUserResponse {
  id?: string;
  userId?: string;
  firebaseId?: string;
}

export interface CreateClientRequest {
  userId: string;
  document: string;
  documentType: string;
  name: string;
  cell: string;
  email: string;
}

export interface CreateClientResponse {
  id: string;
  userId: string;
  documento: string;
  tipoDocumento: string;
  nombre: string;
  celular: string;
  correo: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface ClientRegistrationResult {
  userId: string;
  clientId?: string;
  message?: string;
}