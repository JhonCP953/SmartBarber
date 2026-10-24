export interface Information {
  id: string;
  name: string;
}

export interface BarbershopInformation extends Information {
  location: string;
}

export interface OpenAndCloseEventQueue {
  type: string;
  employee: Information;
  barbershop: BarbershopInformation;
}