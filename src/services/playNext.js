import { EmbedBuilder } from "discord.js";
import { spawn } from "child_process";
import { AudioPlayerStatus } from "@discordjs/voice";
import djsv from "../facades/discordJSVoice.js";
import AudioType from "../enums/AudioType.js";
import discordJSVoice from "../facades/discordJSVoice.js";

export default async function(interaction, client)
{
    if (djsv.getQueueSize(client) <= 0)
    {
        if (discordJSVoice.getStatus(client) === AudioPlayerStatus.Playing)
            await discordJSVoice.stop();
        return;
    }
    const track = djsv.popFromQueue(client);
    const ytdlp = await spawn("yt-dlp", ['-f', 'bestaudio[ext=webm]/bestaudio', '-o', '-', '--quiet', '--no-warnings', track.url], { stdio: ['ignore', 'pipe', 'inherit'] });
    await djsv.play(client, ytdlp.stdout, AudioType.MUSIC);
    const embed = new EmbedBuilder()
    .setTitle("🎵 Tocando agora")
    .setDescription(`**[${track.title}](${track.url})**`)
    .setThumbnail(track.thumbnail)
    interaction.channel.send({ embeds: [embed] });
}