import djsv from "#facades/djsv.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import AudioType from "#enums/AudioType.js";
import invokeFfmpeg from "#utils/invokeFfmpeg.js";
import invokeYtdlp from "#utils/invokeYtdlp.js";
import createembed from "#utils/createembed.js";

export default {
    name: "playMusic",
    async execute(client, interaction) {
        if (djsv.getQueueSize(client) <= 0) {
            if (djsv.getStatus(client) === AudioPlayerStatus.Playing)
                await djsv.stop();
            return;
        }
        const track = djsv.popFromQueue(client);
        const ytdlp = invokeYtdlp(track.url)
        const ffmpeg = invokeFfmpeg();
        ytdlp.stdout.pipe(ffmpeg.stdin);
        await djsv.play(client, ffmpeg.stdout, AudioType.MUSIC);
        await interaction.channel.send({ embeds: [ await createembed("🎵 Tocando agora", `**[${track.title}](${track.url})**`, track.thumbnail, null, { text: `Solicitada por ${interaction.user.username}` }) ] });
    }
}