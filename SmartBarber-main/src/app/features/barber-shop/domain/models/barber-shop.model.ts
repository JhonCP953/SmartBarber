export type DocumentType =
  'CC' |
  'CE' |
  'NIT';


export interface BarberShopRegisterRequest {

  name: string;

  description: string;

  location: string;

  phone: string;

  document: string;

  documentType: DocumentType;

  companyName: string;

}


export interface BarberShopResponse {

  id?: string;

  name: string;

  description: string;

  location: string;

  phone: string;

  document: string;

  documentType: DocumentType;

  companyName: string | null;

  status?: string;

  createAt?: string;

  updateAt?: string | null;

}


export interface BarberShopErrorResponse {

  reason: string;

  code: string;

  message: string;

  date: string;

}


export interface BarberShopErrorWrapper {

  data: BarberShopErrorResponse;

}

/*
 * =====================================================
 * TYPE GUARD
 * =====================================================
 */

export function isBarberShopErrorResponse(
  response: unknown
): response is BarberShopErrorWrapper {

  if (
    response === null ||
    typeof response !== 'object'
  ) {
    return false;
  }

  const responseObject =
    response as Record<string, unknown>;

  const data =
    responseObject['data'];

  if (
    data === null ||
    typeof data !== 'object'
  ) {
    return false;
  }

  const error =
    data as Record<string, unknown>;

  return (
    typeof error['reason'] === 'string' &&
    typeof error['code'] === 'string' &&
    typeof error['message'] === 'string' &&
    typeof error['date'] === 'string'
  );
}