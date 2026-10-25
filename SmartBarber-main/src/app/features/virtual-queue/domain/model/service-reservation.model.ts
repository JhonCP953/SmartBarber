export interface ServiceReservation{
  barberiaId?: string,
  serviceName: string,
  description?: string,
  duration: number,
  price?: number,
  offert?: boolean,
  special_price?: number
}