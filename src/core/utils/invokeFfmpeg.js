import { spawn } from "child_process";

export default function() {
    const args = [
        "-y",
        "-i", "pipe:0",
        "-c:a", "libopus",
        "-f", "opus",
        "pipe:1"
    ];
    const ffmpeg = spawn("ffmpeg", args);

    ffmpeg.stdin.on("error", (err) => {
        if (err.code !== "EPIPE" && err.code !== "EOF") reject(err);
    });
    return ffmpeg;
}