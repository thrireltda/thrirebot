import ytdlp from 'yt-dlp-exec';
import ffmpegPath from 'ffmpeg-static';

export default function(url) {
    // Usamos o .exec() para retornar o objeto do subprocesso imediatamente
    // Isso permite acessar o .stdout para fazer o pipe
    return ytdlp.exec(url, {
        // Flags do yt-dlp
        format: 'bestaudio/best',
        output: '-', // Importante: envia o   udio para o stdout
        ffmpegLocation: ffmpegPath,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: [
            'referer:youtube.com',
            'user-agent:googlebot'
        ]
    });
}