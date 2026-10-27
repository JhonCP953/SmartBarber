/** Convierte el error HTTP de crear reserva en un mensaje legible para el usuario. */
export function mensajeErrorReserva(err: any): string {
  const body = err?.error;
  const detalle = body?.data ?? body;

  let mensaje: string =
    detalle?.message ||
    body?.message ||
    body?.error ||
    (typeof body === 'string' ? body : '') ||
    'Error al procesar la reserva';
  const codigo = detalle?.code ? ` [${detalle.code}]` : '';

  if (String(mensaje).includes('Failed to read HTTP message')) {
    mensaje = 'El servidor no pudo leer los datos de la reserva (formato del cuerpo). ' +
              'Revisa la consola y avisa al equipo de backend.';
  }
  return `Atención del Sistema${codigo}: ${mensaje}`;
}
