// Configuración central de endpoints de formularios.
//
// Por defecto usa Formspree (https://formspree.io) — un servicio gratuito
// que recibe el formulario y te lo envía por correo, sin necesidad de que
// levantes tu propio servidor. Pasos para activarlo:
//
//   1. Crea una cuenta gratis en https://formspree.io
//   2. Crea un formulario nuevo y copia su "Form ID" (algo como "mgvkzqjn")
//   3. Reemplaza 'TU_FORM_ID_RESERVA' y 'TU_FORM_ID_BOLETIN' abajo
//
// Si más adelante tienes tu propio backend (Node/Express, .NET, etc.),
// solo reemplaza estas URLs por las de tu API, por ejemplo:
//   appointmentEndpoint: 'https://api.tudominio.com/reservas'
// El resto del código (appointment.component.ts, footer.component.ts)
// no necesita cambios: ambos hacen un POST con JSON a la URL que pongas aquí.

export const formEndpoints = {
  appointmentEndpoint: 'https://formspree.io/f/TU_FORM_ID_RESERVA',
  newsletterEndpoint: 'https://formspree.io/f/TU_FORM_ID_BOLETIN'
};
