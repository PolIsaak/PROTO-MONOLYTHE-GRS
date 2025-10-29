import { addKeyword, EVENTS } from '@builderbot/bot';
import { getAppointmentsByPhone } from '../services/api.service.js';

/**
 * Flujo de bienvenida
 * Se activa cuando un usuario envía su primer mensaje
 */
const welcomeFlow = addKeyword(EVENTS.WELCOME)
  .addAnswer(
    '¡Hola! 👋 Bienvenido al sistema de citas',
    { delay: 500 }
  )
  .addAnswer([
    'Puedo ayudarte con:',
    '',
    '📅 *cita* - Agendar una nueva cita',
    '📋 *consultar* - Ver tus citas programadas',
    '❓ *ayuda* - Información adicional',
    '',
    '¿En qué puedo ayudarte hoy?'
  ]);

/**
 * Flujo de ayuda
 */
const helpFlow = addKeyword(['ayuda', 'help', 'info'])
  .addAnswer([
    '🤖 *Comandos disponibles:*',
    '',
    '📅 *cita* o *agendar* - Para crear una nueva cita',
    '📋 *consultar* o *mis citas* - Ver tus citas',
    '🔄 *estado* - Verificar estado de una cita',
    '❌ *cancelar* - Cancelar una cita',
    '',
    'También puedes simplemente escribirme lo que necesitas y te ayudaré.'
  ]);

export default welcomeFlow;
export { helpFlow };
