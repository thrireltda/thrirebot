import { spawn } from "child_process";
import djsv from "#facades/djsv.js";
import AudioType from "#enums/AudioType.js";

export default async function(client) {
    return new Promise(async (resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
            "-y",
            "-i", "pipe:0",
            "-c:a", "libopus",
            "-f", "opus",
            "pipe:1"
        ], { cwd: "./.cache" });
        client.audioPlayer.once("stateChange", (oldState, newState) => {
            if (newState.status === "idle" && djsv.audioType !== AudioType.ESPEAK) ffmpeg.kill("SIGKILL");
        });
        ffmpeg.stdin.on("error", (err) => {
            if (err.code !== "EPIPE" && err.code !== "EOF") reject(err);
        });
        ffmpeg.on("error", reject);
        resolve(ffmpeg);
    })
}