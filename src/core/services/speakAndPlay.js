import { spawn } from "child_process";
import djsv from "../facades/discordJSVoice.js";
import AudioType from "#enums/AudioType.js";

export default async function(client, resposta)
{
    return new Promise(async (resolve, reject) =>
    {
        const espeakng = spawn('espeak-ng', ['-v', 'pt-br', '-s', '175', '--stdout']);
        const ffmpeg = spawn('ffmpeg', ['-y', '-i', 'pipe:0', '-f', 'mp3', 'pipe:1']);
        espeakng.stdout.pipe(ffmpeg.stdin);
        espeakng.stdin.write(resposta);
        espeakng.stdin.end();

        client.audioPlayer.once("stateChange", (oldState, newState) => {
            if (newState.status === "idle" && djsv.audioType !== AudioType.ESPEAK) {
                espeakng.kill("SIGKILL");
                ffmpeg.kill("SIGKILL");
            }
        });
        ffmpeg.stdin.on("error", (err) => {
            if (err.code !== "EPIPE" && err.code !== "EOF") reject(err);
        });
        espeakng.stdin.on("error", (err) => {
            if (err.code !== "EPIPE" && err.code !== "EOF") reject(err);
        });


        ffmpeg.on("error", reject);
        espeakng.on("error", reject);
        await djsv.play(client, ffmpeg.stdout, AudioType.ESPEAK).then(resolve).catch(reject);
    })
}