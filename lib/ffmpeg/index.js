import { spawn } from "child_process";

export default async function(audioPath)
{
    return new Promise((resolve, reject) =>
    {
        const ffmpeg = spawn('ffmpeg', ['-y', '-i', audioPath, '-f', 'null', '-']);
        ffmpeg.on('exit', (code) =>
        {
            if (code !== 0)
                reject(new Error(`ffmpeg falhou com código ${code}`));
            resolve();
        });
    })
}