export const MONTH_NAMES: string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export interface MesCalendario {
  titulo: string;     // "Octubre 2026"
  dias: number[];     // [1..N]
  relleno: number[];  // celdas vacías antes del día 1 (semana inicia en lunes)
}

export function construirMes(fecha: Date): MesCalendario {
  const year = fecha.getFullYear();
  const month = fecha.getMonth();

  const diasEnMes = new Date(year, month + 1, 0).getDate();
  let primerDia = new Date(year, month, 1).getDay();
  primerDia = primerDia === 0 ? 6 : primerDia - 1;

  return {
    titulo: `${MONTH_NAMES[month]} ${year}`,
    dias: Array.from({ length: diasEnMes }, (_, i) => i + 1),
    relleno: Array.from({ length: primerDia }, (_, i) => i)
  };
}

/** Arma YYYY-MM-DD a partir del mes visible y el día elegido */
export function aFechaIso(fecha: Date, dia: number): string {
  const year = fecha.getFullYear();
  const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}-${dia.toString().padStart(2, '0')}`;
}
