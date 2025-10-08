import djsv from "#facades/djsv.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import AudioType from "#enums/AudioType.js";
import createembed from "#utils/createembed.js";
import invokeFfmpeg from "#utils/invokeFfmpeg.js";
import invokeYtdlp from "#utils/invokeYtdlp.js";

export default {
    name: "audioPlayerIdle",
    async execute(interaction, client) {
        if (djsv.getQueueSize(client) <= 0) {
            if (djsv.getStatus(client) === AudioPlayerStatus.Playing) await djsv.stop();
            return;
        }
        const track = djsv.popFromQueue(client);
        const ffmpeg = await invokeFfmpeg(client);
        const stdout = await invokeYtdlp(client, ffmpeg, track.url)
        await djsv.play(client, stdout, AudioType.MUSIC);
        interaction.channel.send({ embeds: [ await createembed("🎵 Tocando agora", `**[${track.title}](${track.url})**`, track.thumbnail) ] });
    }
}