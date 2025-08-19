import { spawn } from "child_process";

export default async function(resposta, audioPath)
{
    return new Promise((resolve, reject) =>
    {
        const wavTemp = audioPath.replace('.mp3', '.wav');
        const espeakng = spawn('espeak-ng', ['-v', 'pt-br', '-s', '175', '-w', wavTemp]);
        espeakng.stdin.write(resposta);
        espeakng.stdin.end();

        espeakng.on('exit', () =>
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