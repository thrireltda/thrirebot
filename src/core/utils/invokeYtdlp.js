import { spawn } from "child_process";

export default async function(client, entry, data) {
    return new Promise(async (resolve) => {
        const command = await spawn("yt-dlp", [
            '-f', 'bestaudio[ext=webm]/bestaudio',
            '-o', '-',
            '--quiet',
            '--no-warnings',
            data
        ], { stdio: ['ignore', 'pipe', 'inherit'] });
        command.stdout.pipe(entry.stdin);
        resolve(entry.stdout);
    })
}