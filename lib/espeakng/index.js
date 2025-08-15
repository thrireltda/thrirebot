import { spawn } from "child_process";

export default async function(resposta, audioPath)
{
    return new Promise((resolve, reject) =>
    {
        const wavTemp = audioPath.replace('.mp3', '.wav');
        const espeak = spawn('espeak-ng', ['-v', 'pt-br', '-s', '175', '-w', wavTemp]);
        espeak.stdin.write(resposta);
        espeak.stdin.end();

        espeak.on('exit', () =>
        {
            const ffmpeg = spawn('ffmpeg', ['-y', '-i', wavTemp, audioPath]);
            ffmpeg.on('exit', (code) =>
            {
                if (code !== 0)
                    reject(new Error(`ffmpeg falhou com código ${code}`));
                resolve();
            });
        });
    })
}