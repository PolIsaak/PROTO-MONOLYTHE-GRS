import { addKeyword } from '@builderbot/bot';
import { getAppointmentsByPhone, updateAppointmentStatus } from '../services/api.service.js';

/**
 * Flujo para consultar citas
 */
const statusFlow = addKeyword(['consultar', 'mis citas', 'estado', 'ver citas'])
  .addAnswer(
    '📋 Déjame buscar tus citas...',
    { delay: 1000 },
    async (ctx, { flowDynamic, endFlow }) => {
      try {
        const phone = ctx.from.replace('@s.whatsapp.net', '');
        const appointments = await getAppointmentsByPhone(phone);
        
        if (!appointments || appointments.length === 0) {
          await flowDynamic([
            '😊 No tienes citas agendadas en este momento.',
            '',
            'Escribe *cita* si deseas agendar una nueva cita.'
          ]);
          return endFlow();
        }
        
        // Separar citas por estado
        const pending = appointments.filter(a => a.status === 'pending');
        const confirmed = appointments.filter(a => a.status === 'confirmed');
        const cancelled = appointments.filter(a => a.status === 'cancelled');
        const completed = appointments.filter(a => a.status === 'completed');
        
        let message = ['📅 *Tus citas:*', ''];
        
        // Citas pendientes
        if (pending.length > 0) {
          message.push('⏳ *Pendientes:*');
          pending.forEach(apt => {
            message.push(
              `• ID: ${apt.id}`,
              `  ${apt.date} a las ${apt.time}`,
              `  Servicio: ${apt.service}`,
              ''
            );
          });
        }
        
        // Citas confirmadas
        if (confirmed.length > 0) {
          message.push('✅ *Confirmadas:*');
          confirmed.forEach(apt => {
            message.push(
              `• ID: ${apt.id}`,
              `  ${apt.date} a las ${apt.time}`,
              `  Servicio: ${apt.service}`,
              ''
            );
          });
        }
        
        // Citas completadas (últimas 3)
        if (completed.length > 0) {
          message.push('✔️ *Completadas (últimas 3):*');
          completed.slice(0, 3).forEach(apt => {
            message.push(
              `• ID: ${apt.id}`,
              `  ${apt.date} a las ${apt.time}`,
              `  Servicio: ${apt.service}`,
              ''
            );
          });
        }
        
        // Citas canceladas (últimas 2)
        if (cancelled.length > 0) {
          message.push('❌ *Canceladas (últimas 2):*');
          cancelled.slice(0, 2).forEach(apt => {
            message.push(
              `• ID: ${apt.id}`,
              `  ${apt.date} a las ${apt.time}`,
              `  Servicio: ${apt.service}`,
              ''
            );
          });
        }
        
        message.push(
          '💡 Para más opciones, escribe:',
          '• *cancelar [ID]* - Cancelar una cita',
          '• *confirmar [ID]* - Confirmar una cita'
        );
        
        await flowDynamic(message);
        
      } catch (error) {
        console.error('Error en statusFlow:', error);
        await flowDynamic(
          '❌ Ocurrió un error al buscar tus citas. Por favor, intenta de nuevo.'
        );
      }
      
      return endFlow();
    }
  );

/**
 * Flujo para confirmar una cita
 */
const confirmFlow = addKeyword(['confirmar'])
  .addAnswer(
    '¿Cuál es el ID de la cita que deseas confirmar?',
    { capture: true },
    async (ctx, { flowDynamic, fallBack, endFlow }) => {
      try {
        const input = ctx.body.trim();
        const appointmentId = parseInt(input);
        
        if (isNaN(appointmentId)) {
          return fallBack('Por favor, proporciona un ID de cita válido (número)');
        }
        
        const phone = ctx.from.replace('@s.whatsapp.net', '');
        const result = await updateAppointmentStatus(appointmentId, phone, 'confirmed');
        
        if (result.success) {
          await flowDynamic([
            '✅ *Cita confirmada exitosamente*',
            '',
            `ID: ${appointmentId}`,
            '',
            '¡Nos vemos pronto!'
          ]);
        } else {
          await flowDynamic(
            result.message || '❌ No se pudo confirmar la cita. Verifica el ID o contacta con soporte.'
          );
        }
        
      } catch (error) {
        console.error('Error en confirmFlow:', error);
        await flowDynamic(
          '❌ Ocurrió un error. Por favor, intenta de nuevo.'
        );
      }
      
      return endFlow();
    }
  );

/**
 * Flujo para cancelar una cita existente
 */
const cancelExistingFlow = addKeyword(['cancelar cita'])
  .addAnswer(
    '¿Cuál es el ID de la cita que deseas cancelar?',
    { capture: true },
    async (ctx, { flowDynamic, fallBack, endFlow }) => {
      try {
        const input = ctx.body.trim();
        const appointmentId = parseInt(input);
        
        if (isNaN(appointmentId)) {
          return fallBack('Por favor, proporciona un ID de cita válido (número)');
        }
        
        const phone = ctx.from.replace('@s.whatsapp.net', '');
        const result = await updateAppointmentStatus(appointmentId, phone, 'cancelled');
        
        if (result.success) {
          await flowDynamic([
            '✅ *Cita cancelada exitosamente*',
            '',
            `ID: ${appointmentId}`,
            '',
            '¿Deseas agendar una nueva cita? Escribe *cita*'
          ]);
        } else {
          await flowDynamic(
            result.message || '❌ No se pudo cancelar la cita. Verifica el ID o contacta con soporte.'
          );
        }
        
      } catch (error) {
        console.error('Error en cancelExistingFlow:', error);
        await flowDynamic(
          '❌ Ocurrió un error. Por favor, intenta de nuevo.'
        );
      }
      
      return endFlow();
    }
  );

export default statusFlow;
export { confirmFlow, cancelExistingFlow };