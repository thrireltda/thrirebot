import pkg from 'whatsapp-web.js';
import { writeFileSync } from 'fs';
import { createCanvas } from 'canvas';
import qrcode from 'qrcode';
const { Client, LocalAuth } = pkg;

let qrCallback = null;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});

client.on('qr', async qr => {
    if (qrCallback) {
        try {
            const qrDataURL = await qrcode.toDataURL(qr);
            qrCallback(qrDataURL);
        } catch (err) {
            console.error('[WHATSAPP] Erro ao gerar QR:', err);
        }
    }
});

client.on('ready', () => {
    console.log('[WHATSAPP] Cliente pronto');
});

client.on('auth_failure', () => {
    console.error('[WHATSAPP] Falha na autenticação');
});

client.on('disconnected', () => {
    console.warn('[WHATSAPP] Desconectado');
});

client.initialize();

export async function enviarMensagemWhatsApp(numero, mensagem) {
    const chatId = `${numero}@c.us`;
    await client.sendMessage(chatId, mensagem);
}

export function setQrCallback(callback) {
    qrCallback = callback;
}

export function isWhatsappReady() {
    return client.info?.wid?.user;
}