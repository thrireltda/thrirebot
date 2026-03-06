import { spawn } from "child_process";

export default function(data) {
    const args = [
        '-f', 'bestaudio[ext=webm]/bestaudio',
        '-o', '-',
        '--quiet',
        '--no-warnings',
        data ? data : "pipe:0"
    ]
    const ytldp = spawn("yt-dlp", args, { stdio: ['ignore', 'pipe', 'inherit']});
    return ytldp;
}