import { spawn } from "child_process";

export default async function (client, entry, data) {
    return new Promise((resolve, reject) => {
        const command = spawn("espeak-ng", [
            "-v", "pt-br",
            "-s", "175",
            "--stdout"
        ]);
        if (entry) command.stdout.pipe(entry.stdin);
        command.stdin.end(data);
        command.on("error", reject);
        entry.on("error", reject);
        resolve(entry.stdout);
    });
}