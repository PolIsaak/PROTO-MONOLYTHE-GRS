import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/provider-baileys';
import dotenv from 'dotenv';
import welcomeFlow from './flows/welcome.flow.js';
import appointmentFlow from './flows/appointment.flow.js';
import statusFlow from './flows/status.flow.js';

dotenv.config();

const PORT = process.env.WHATSAPP_PORT || 3001;
const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Función principal para inicializar el bot de WhatsApp
 */
const main = async () => {
  try {
    // Configurar el adaptador de base de datos (en memoria para el bot)
    const adapterDB = new MemoryDB();

    // Crear los flows del bot
    const adapterFlow = createFlow([
      welcomeFlow,
      appointmentFlow,
      statusFlow
    ]);

    // Configurar el provider de Baileys (WhatsApp)
    const adapterProvider = createProvider(BaileysProvider, {
      name: 'whatsapp-bot',
      gifPlayback: false,
    });

    // Crear el bot con todas las configuraciones
    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    // Iniciar servidor HTTP
    httpServer(+PORT);

    console.log(`🤖 Bot de WhatsApp iniciado en puerto ${PORT}`);
    console.log(`📡 Conectando con API en ${API_URL}`);
    console.log(`📱 Escanea el código QR para conectar WhatsApp`);

    // Endpoint para enviar mensajes desde el backend
    adapterProvider.server.post('/v1/messages', handleCtx(async (bot, req, res) => {
      try {
        const { number, message, media } = req.body;

        if (!number || !message) {
          return res.status(400).json({
            success: false,
            error: 'Número y mensaje son requeridos'
          });
        }

        // Formatear número para WhatsApp
        const formattedNumber = number.includes('@s.whatsapp.net') 
          ? number 
          : `${number}@s.whatsapp.net`;

        // Enviar mensaje
        await bot.sendMessage(formattedNumber, message, media ? { media } : {});

        return res.json({
          success: true,
          message: 'Mensaje enviado correctamente'
        });
      } catch (error) {
        console.error('Error enviando mensaje:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }));

    // Endpoint para verificar el estado del bot
    adapterProvider.server.get('/v1/status', handleCtx(async (bot, req, res) => {
      return res.json({
        success: true,
        status: 'online',
        timestamp: new Date().toISOString()
      });
    }));

    // Endpoint para obtener info de un número
    adapterProvider.server.post('/v1/check-number', handleCtx(async (bot, req, res) => {
      try {
        const { number } = req.body;

        if (!number) {
          return res.status(400).json({
            success: false,
            error: 'Número es requerido'
          });
        }

        const formattedNumber = number.replace(/[^0-9]/g, '');
        const result = await adapterProvider.vendor.onWhatsApp(`${formattedNumber}@s.whatsapp.net`);

        return res.json({
          success: true,
          exists: result.length > 0 && result[0].exists,
          jid: result.length > 0 ? result[0].jid : null
        });
      } catch (error) {
        console.error('Error verificando número:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }));

  } catch (error) {
    console.error('❌ Error iniciando el bot:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar el bot
main();