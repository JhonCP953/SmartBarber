// Modelo para la petición de registro de barbería (POST)
export interface BarberShopRegisterRequest {
  name: string;
  description: string;
  location: string;
  phone: string;
  document: string;
  documentType: string;
  companyName: string;
}

// Modelo para la respuesta recibida desde el backend
export interface BarberShopResponse {
  id?: number | string;
  name: string;
  description: string;
  location: string;
  phone: string;
  document: string;
  documentType: string;
  companyName: string;
}