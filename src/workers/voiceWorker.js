import { parentPort } from 'worker_threads';
import { pipeline } from '@xenova/transformers';

let transcriber;
let audioBuffer = [];
let lastChunkTime = Date.now();
const CHUNK_MS = 1000; // processa a cada 1 segundo

(async () => {
    transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-small',
        { quantized: true }
    );
    parentPort.postMessage({ type: 'ready' });
})();

parentPort.on('message', async ({ type, buffer, userId, guildId }) => {
    if (type !== 'audio') return;

    audioBuffer.push(Buffer.from(buffer));

    // Se já passou 1 segundo desde o último envio
    if (Date.now() - lastChunkTime >= CHUNK_MS) {
        const fullBuffer = Buffer.concat(audioBuffer);
        audioBuffer = [];
        lastChunkTime = Date.now();

        // Converte para Float32
        const float32Buffer = new Float32Array(fullBuffer.length / 2);
        for (let i = 0; i < float32Buffer.length; i++) {
            float32Buffer[i] = fullBuffer.readInt16LE(i * 2) / 32768;
        }

        try {
            const result = await transcriber(float32Buffer);

            parentPort.postMessage({
                type: 'transcript',
                text: result.text.trim(),
                userId,
                guildId,
                ts: Date.now()
            });
        } catch (err) {
            console.error("❌ Erro no transcriber:", err);
        }
    }
});
