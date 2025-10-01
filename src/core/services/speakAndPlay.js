import { spawn } from "child_process";
import discordJSVoice from "../facades/discordJSVoice.js";

export default async function(client, resposta)
{
    return new Promise(async (resolve, reject) =>
    {
        const espeakng = spawn('espeak-ng', ['-v', 'pt-br', '-s', '175', '--stdout']);
        const ffmpeg = spawn('ffmpeg', ['-y', '-i', 'pipe:0', '-f', 'mp3', 'pipe:1']);
        espeakng.stdout.pipe(ffmpeg.stdin);
        espeakng.stdin.write(resposta);
        espeakng.stdin.end();
        ffmpeg.on("error", reject);
        espeakng.on("error", reject);
        await discordJSVoice.stop(client);
        await discordJSVoice.play(client, ffmpeg.stdout).then(resolve).catch(reject);
    })
}