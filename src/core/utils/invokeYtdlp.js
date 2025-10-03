import { spawn } from "child_process";
import djsv from "#facades/djsv.js";
import AudioType from "#enums/AudioType.js";

export default async function(client, entry, data) {
    return new Promise(async (resolve, reject) => {
        const ytdlp = await spawn("yt-dlp", [
            '-f', 'bestaudio[ext=webm]/bestaudio',
            '-o', '-',
            '--quiet',
            '--no-warnings',
            data
        ], { stdio: ['ignore', 'pipe', 'inherit'] });

        ytdlp.stdout.pipe(entry.stdin);
        resolve(entry.stdout);
    })
}