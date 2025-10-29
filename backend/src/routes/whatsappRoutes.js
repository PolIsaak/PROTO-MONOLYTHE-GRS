import express from 'express';
import axios from 'axios';

const router = express.Router();

// URL del bot de WhatsApp
const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:3002';

/**
 * Enviar mensaje de WhatsApp
 * POST /api/whatsapp/send
 */
router.post('/send', async (req, res) => {
  try {
    const { phone, message, media } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Teléfono y mensaje son requeridos',
      });
    }

    // Enviar mensaje a través del bot
    const response = await axios.post(`${WHATSAPP_BOT_URL}/v1/messages`, {
      number: phone,
      message,
      media,
    });

    res.json({
      success: true,
      message: 'Mensaje enviado',
      data: response.data,
    });
  } catch (error) {
    console.error('Error enviando mensaje WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando mensaje',
      details: error.message,
    });
  }
});

/**
 * Verificar si un número existe en WhatsApp
 * POST /api/whatsapp/check-number
 */
router.post('/check-number', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Número de teléfono requerido',
      });
    }

    const response = await axios.post(`${WHATSAPP_BOT_URL}/v1/check-number`, {
      number: phone,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error verificando número:', error);
    res.status(500).json({
      success: false,
      error: 'Error verificando número',
      details: error.message,
    });
  }
});

/**
 * Verificar estado del bot
 * GET /api/whatsapp/status
 */
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${WHATSAPP_BOT_URL}/v1/status`, {
      timeout: 5000,
    });

    res.json({
      success: true,
      bot_status: response.data.status,
      timestamp: response.data.timestamp,
    });
  } catch (error) {
    res.json({
      success: false,
      bot_status: 'offline',
      error: 'Bot no disponible',
    });
  }
});

/**
 * Enviar recordatorio de cita
 * POST /api/whatsapp/reminder/:appointmentId
 */
router.post('/reminder/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const db = req.app.get('db');

    // Obtener la cita
    const appointment = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM appointments WHERE id = ?',
        [appointmentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada',
      });
    }

    // Construir mensaje de recordatorio
    const message = [
      '🔔 *Recordatorio de Cita*',
      '',
      `Hola ${appointment.name},`,
      '',
      'Te recordamos tu cita:',
      `📅 Fecha: ${appointment.date}`,
      `🕐 Hora: ${appointment.time}`,
      `💼 Servicio: ${appointment.service}`,
      '',
      '¡Te esperamos!',
    ].join('\n');

    // Enviar mensaje
    await axios.post(`${WHATSAPP_BOT_URL}/v1/messages`, {
      number: appointment.phone,
      message,
    });

    res.json({
      success: true,
      message: 'Recordatorio enviado',
    });
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando recordatorio',
      details: error.message,
    });
  }
});

/**
 * Notificar cambio de estado de cita
 * POST /api/whatsapp/notify-status-change
 */
router.post('/notify-status-change', async (req, res) => {
  try {
    const { appointmentId, newStatus } = req.body;
    const db = req.app.get('db');

    const appointment = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM appointments WHERE id = ?',
        [appointmentId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada',
      });
    }

    let statusEmoji = '📋';
    let statusText = newStatus;

    switch (newStatus) {
      case 'confirmed':
        statusEmoji = '✅';
        statusText = 'Confirmada';
        break;
      case 'cancelled':
        statusEmoji = '❌';
        statusText = 'Cancelada';
        break;
      case 'completed':
        statusEmoji = '✔️';
        statusText = 'Completada';
        break;
    }

    const message = [
      `${statusEmoji} *Actualización de Cita*`,
      '',
      `Hola ${appointment.name},`,
      '',
      `Tu cita para el ${appointment.date} a las ${appointment.time} ha sido *${statusText}*.`,
      '',
      '¿Necesitas ayuda? Escríbenos.',
    ].join('\n');

    await axios.post(`${WHATSAPP_BOT_URL}/v1/messages`, {
      number: appointment.phone,
      message,
    });

    res.json({
      success: true,
      message: 'Notificación enviada',
    });
  } catch (error) {
    console.error('Error enviando notificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error enviando notificación',
      details: error.message,
    });
  }
});

export default router;
