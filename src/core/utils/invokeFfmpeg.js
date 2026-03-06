import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

export default function() {
    const args = [
        "-y",
        "-i", "pipe:0",     // Recebe o áudio do yt-dlp via stdin
        "-c:a", "libopus",  // Codifica para Opus
        "-f", "opus",       // Formato de saída Opus
        "-ar", "48000",     // Sample rate padrão para Discord/WhatsApp
        "-ac", "2",          // Stereo
        "pipe:1"            // Envia o áudio processado via stdout
    ];

    // Usamos o ffmpegPath em vez da string "ffmpeg"
    const ffmpeg = spawn(ffmpegPath, args);

    ffmpeg.stdin.on("error", (err) => {
        // Ignora erros de pipe quebrado (comum quando a música para)
        if (err.code !== "EPIPE" && err.code !== "EOF") {
            console.error("FFmpeg Stdin Error:", err);
        }
    });

    ffmpeg.stderr.on("data", (data) => {
        // Opcional: Descomente para ver logs do FFmpeg em caso de erro
        // console.log(`FFmpeg log: ${data}`);
    });

    return ffmpeg;
}