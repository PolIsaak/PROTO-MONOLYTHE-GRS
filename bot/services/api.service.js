import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Cliente HTTP configurado para comunicarse con el backend
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Manejo de errores centralizado
 */
const handleError = (error, context) => {
  console.error(`Error en ${context}:`, error.message);
  
  if (error.response) {
    console.error('Response error:', error.response.data);
    return {
      success: false,
      message: error.response.data.message || 'Error en el servidor',
      error: error.response.data,
    };
  } else if (error.request) {
    console.error('Request error:', error.request);
    return {
      success: false,
      message: 'No se pudo conectar con el servidor',
    };
  } else {
    console.error('Error:', error.message);
    return {
      success: false,
      message: 'Error inesperado',
    };
  }
};

/**
 * Crear una nueva cita
 * @param {Object} appointmentData - Datos de la cita
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await apiClient.post('/api/appointments', appointmentData);
    return {
      success: true,
      appointment: response.data.appointment,
      message: 'Cita creada exitosamente',
    };
  } catch (error) {
    return handleError(error, 'createAppointment');
  }
};

/**
 * Obtener todas las citas de un número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {Promise<Array>} - Lista de citas
 */
export const getAppointmentsByPhone = async (phone) => {
  try {
    const response = await apiClient.get(`/api/appointments/phone/${phone}`);
    return response.data.appointments || [];
  } catch (error) {
    console.error('Error obteniendo citas:', error.message);
    return [];
  }
};

/**
 * Obtener una cita específica por ID
 * @param {number} id - ID de la cita
 * @returns {Promise<Object|null>} - Cita encontrada o null
 */
export const getAppointmentById = async (id) => {
  try {
    const response = await apiClient.get(`/api/appointments/${id}`);
    return response.data.appointment || null;
  } catch (error) {
    console.error('Error obteniendo cita:', error.message);
    return null;
  }
};

/**
 * Actualizar el estado de una cita
 * @param {number} id - ID de la cita
 * @param {string} phone - Número de teléfono del usuario
 * @param {string} status - Nuevo estado (pending, confirmed, cancelled, completed)
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateAppointmentStatus = async (id, phone, status) => {
  try {
    // Primero verificar que la cita pertenece al usuario
    const appointment = await getAppointmentById(id);
    
    if (!appointment) {
      return {
        success: false,
        message: 'Cita no encontrada',
      };
    }
    
    if (appointment.phone !== phone) {
      return {
        success: false,
        message: 'No tienes permiso para modificar esta cita',
      };
    }
    
    const response = await apiClient.put(`/api/appointments/${id}`, { status });
    
    return {
      success: true,
      appointment: response.data.appointment,
      message: 'Estado actualizado correctamente',
    };
  } catch (error) {
    return handleError(error, 'updateAppointmentStatus');
  }
};

/**
 * Eliminar una cita
 * @param {number} id - ID de la cita
 * @param {string} phone - Número de teléfono del usuario
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteAppointment = async (id, phone) => {
  try {
    // Verificar que la cita pertenece al usuario
    const appointment = await getAppointmentById(id);
    
    if (!appointment) {
      return {
        success: false,
        message: 'Cita no encontrada',
      };
    }
    
    if (appointment.phone !== phone) {
      return {
        success: false,
        message: 'No tienes permiso para eliminar esta cita',
      };
    }
    
    await apiClient.delete(`/api/appointments/${id}`);
    
    return {
      success: true,
      message: 'Cita eliminada correctamente',
    };
  } catch (error) {
    return handleError(error, 'deleteAppointment');
  }
};

/**
 * Verificar si un número existe en WhatsApp
 * @param {string} phone - Número de teléfono
 * @returns {Promise<Object>} - Resultado de la verificación
 */
export const checkNumberExists = async (phone) => {
  try {
    const response = await apiClient.post('/api/whatsapp/check-number', { phone });
    return response.data;
  } catch (error) {
    return handleError(error, 'checkNumberExists');
  }
};

/**
 * Obtener estadísticas generales
 * @returns {Promise<Object>} - Estadísticas
 */
export const getStatistics = async () => {
  try {
    const response = await apiClient.get('/api/appointments/stats');
    return response.data.stats || null;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
    return null;
  }
};

/**
 * Enviar recordatorio a un usuario
 * @param {number} appointmentId - ID de la cita
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const sendReminder = async (appointmentId) => {
  try {
    const response = await apiClient.post(`/api/appointments/${appointmentId}/reminder`);
    return {
      success: true,
      message: 'Recordatorio enviado',
    };
  } catch (error) {
    return handleError(error, 'sendReminder');
  }
};

export default {
  createAppointment,
  getAppointmentsByPhone,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  checkNumberExists,
  getStatistics,
  sendReminder,
};