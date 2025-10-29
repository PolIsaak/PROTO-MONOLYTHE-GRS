import { addKeyword } from '@builderbot/bot';
import { createAppointment, checkNumberExists } from '../services/api.service.js';

/**
 * Flujo para agendar citas
 */
const appointmentFlow = addKeyword(['cita', 'agendar', 'agendar cita', 'nueva cita'])
  .addAnswer(
    '📅 Perfecto, vamos a agendar tu cita.',
    { delay: 500 }
  )
  .addAnswer(
    '¿Cuál es tu nombre completo?',
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const name = ctx.body.trim();
      
      if (name.length < 3) {
        return fallBack('Por favor, ingresa tu nombre completo (mínimo 3 caracteres)');
      }
      
      await state.update({ name });
    }
  )
  .addAnswer(
    '¿Cuál es tu correo electrónico?',
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const email = ctx.body.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        return fallBack('Por favor, ingresa un correo electrónico válido');
      }
      
      await state.update({ email });
    }
  )
  .addAnswer(
    '¿Para qué fecha deseas la cita? (formato: DD/MM/YYYY)',
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const dateInput = ctx.body.trim();
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      
      if (!dateRegex.test(dateInput)) {
        return fallBack('Por favor, usa el formato DD/MM/YYYY (ejemplo: 25/12/2024)');
      }
      
      const [, day, month, year] = dateInput.match(dateRegex);
      const date = new Date(year, month - 1, day);
      
      // Validar que la fecha sea válida y futura
      if (isNaN(date.getTime())) {
        return fallBack('Fecha inválida. Por favor, intenta de nuevo.');
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        return fallBack('La fecha debe ser hoy o en el futuro. Por favor, intenta de nuevo.');
      }
      
      await state.update({ 
        date: dateInput,
        dateObj: date 
      });
    }
  )
  .addAnswer(
    '¿A qué hora? (formato: HH:MM, ejemplo: 14:30)',
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const timeInput = ctx.body.trim();
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      
      if (!timeRegex.test(timeInput)) {
        return fallBack('Por favor, usa el formato HH:MM (ejemplo: 14:30)');
      }
      
      await state.update({ time: timeInput });
    }
  )
  .addAnswer(
    '¿Qué servicio necesitas?',
    { capture: true },
    async (ctx, { state, fallBack }) => {
      const service = ctx.body.trim();
      
      if (service.length < 3) {
        return fallBack('Por favor, describe el servicio que necesitas (mínimo 3 caracteres)');
      }
      
      await state.update({ service });
    }
  )
  .addAnswer(
    'Perfecto, déjame confirmar tu cita...',
    { delay: 1000 },
    async (ctx, { state, flowDynamic, endFlow }) => {
      try {
        const appointmentData = state.getMyState();
        const phone = ctx.from.replace('@s.whatsapp.net', '');
        
        // Crear la cita en el backend
        const result = await createAppointment({
          name: appointmentData.name,
          email: appointmentData.email,
          phone: phone,
          date: appointmentData.date,
          time: appointmentData.time,
          service: appointmentData.service,
          status: 'pending'
        });
        
        if (result.success) {
          await flowDynamic([
            '✅ *¡Cita agendada exitosamente!*',
            '',
            `📋 *Detalles de tu cita:*`,
            `👤 Nombre: ${appointmentData.name}`,
            `📅 Fecha: ${appointmentData.date}`,
            `🕐 Hora: ${appointmentData.time}`,
            `💼 Servicio: ${appointmentData.service}`,
            `🆔 ID de cita: ${result.appointment.id}`,
            '',
            '📱 Recibirás un recordatorio antes de tu cita.',
            '',
            '¿Necesitas algo más?'
          ]);
        } else {
          await flowDynamic(
            '❌ Lo siento, hubo un error al agendar tu cita. Por favor, intenta de nuevo más tarde.'
          );
        }
        
        // Limpiar el estado
        state.clear();
        
      } catch (error) {
        console.error('Error en appointmentFlow:', error);
        await flowDynamic(
          '❌ Ocurrió un error inesperado. Por favor, intenta de nuevo.'
        );
      }
      
      return endFlow();
    }
  );

/**
 * Flujo para cancelar el proceso de agendar
 */
const cancelAppointmentFlow = addKeyword(['cancelar', 'salir', 'no'])
  .addAnswer(
    '❌ Proceso cancelado. ¿En qué más puedo ayudarte?'
  );

export default appointmentFlow;
export { cancelAppointmentFlow };