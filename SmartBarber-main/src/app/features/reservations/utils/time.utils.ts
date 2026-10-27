const TIMEZONE_CO = 'America/Bogota';

export function horaAMinutos(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutosAHora(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

/** ISO (UTC o con offset) -> minutos del día en hora de Colombia */
export function isoAMinutosLocal(iso: string): number {
  const hhmm = new Date(iso).toLocaleTimeString('en-GB', {
    timeZone: TIMEZONE_CO,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function ahoraEnMinutos(): number {
  return isoAMinutosLocal(new Date().toISOString());
}

/** Fecha de hoy en Colombia, formato YYYY-MM-DD */
export function hoyColombia(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE_CO });
}
