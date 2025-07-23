import fs from 'fs';
import { spawn } from 'child_process';

export default function gerarAudioEspeak(texto, outputPath, idioma = 'pt-br') {
    return new Promise((resolve, reject) => {
        const wavTemp = outputPath.replace('.mp3', '.wav');
        const espeak = spawn('espeak-ng', ['-v', idioma, '-s', '140', '-w', wavTemp]);

        espeak.stdin.write(texto);
        espeak.stdin.end();

        espeak.on('exit', (code) => {
            if (code !== 0) {
                return reject(new Error(`espeak-ng falhou com código ${code}`));
            }

            const ffmpeg = spawn('ffmpeg', ['-y', '-i', wavTemp, outputPath]);
            ffmpeg.on('exit', (code) => {
                if (code === 0) {
                    try { fs.unlinkSync(wavTemp); } catch {}
                    resolve();
                } else {
                    reject(new Error(`ffmpeg falhou com código ${code}`));
                }
            });

            ffmpeg.on('error', reject);
        });

        espeak.on('error', reject);
    });
}
