// Modelo para la petición de registro de barbería (POST)
export interface BarberShopRegisterRequest {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  celular: string;
  documento: string;
  tipoDocumento: string;
  razonSocial: string;
}

// Modelo para la respuesta recibida desde el backend
export interface BarberShopResponse {
  id?: number | string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  celular: string;
  documento: string;
  tipoDocumento: string;
  razonSocial: string;
}