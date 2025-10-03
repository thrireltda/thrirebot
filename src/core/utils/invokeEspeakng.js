import { spawn } from "child_process";
import fs from "fs";

export default async function (client, entry, data) {
    return new Promise((resolve, reject) => {
        const espeakng = spawn("espeak-ng", [
            "-v", "pt-br",
            "-s", "175",
            "--stdout"
        ]);

        // espeak -> ffmpeg
        espeakng.stdout.pipe(entry.stdin);

        // escreve e fecha
        espeakng.stdin.end(data);

        espeakng.on("error", reject);
        entry.on("error", reject);

        resolve(entry.stdout);
    });
}
