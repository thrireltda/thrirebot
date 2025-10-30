import { spawn } from "child_process";
import djsv from "#facades/djsv.js";
import AudioType from "#enums/AudioType.js";

export default async function(client, entry, data) {
    return new Promise(async (resolve) => {
        const ytdlp =  spawn("yt-dlp", [
            '-f', 'bestaudio[ext=webm]/bestaudio',
            '-o', '-',
            '--quiet',
            '--no-warnings',
            data
        ], { stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, XDG_CACHE_HOME: "./.cache" } });
        entry.on("close", () => {
            ytdlp.kill("SIGKILL");
        })
        ytdlp.stdout.pipe(entry.stdin);
        resolve(entry.stdout);
    })
}