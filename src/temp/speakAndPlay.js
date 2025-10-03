import { spawn } from "child_process";
import { PassThrough } from "stream";
import djsv from "#facades/djsv.js";
import AudioType from "#enums/AudioType.js";

export default async function (client, resposta) {
    return new Promise((resolve, reject) => {
        const espeakng = spawn("espeak-ng", ["-v", "pt-br", "-s", "175", "--stdout"]);
        const ffmpeg = spawn("ffmpeg", ["-y", "-i", "pipe:0", "-f", "mp3", "pipe:1"]);

        espeakng.stdout.pipe(ffmpeg.stdin);
        espeakng.stdin.end(resposta);

        // cria stream novo
        const passthrough = new PassThrough();
        ffmpeg.stdout.pipe(passthrough);

        ffmpeg.on("error", reject);
        espeakng.on("error", reject);

        djsv.play(client, passthrough, AudioType.ESPEAK)
            .then(resolve)
            .catch(reject);
    });
}
