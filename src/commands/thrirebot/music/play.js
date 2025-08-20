import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { spawn } from 'child_process';
import { EmbedBuilder } from 'discord.js';
import ytSearch from 'yt-search';
import DiscordJSVoiceLib from "../../../facades/discordJSVoice.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Toca uma música")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Nome ou link da música")
                .setRequired(true)
        ),
    execute: async ({ interaction, client }) =>
    {
        const embed = new EmbedBuilder();
        await interaction.deferReply();
        {
            if (!client.audioPlayer.musicQueue)
                client.audioPlayer.musicQueue = [];

            client.audioPlayer.on('idle', async () =>
            {
                if (client.audioPlayer.musicQueue.length <= 0 || !client.audioPlayer.isPlaying) return;
                client.audioPlayer.isPlaying = false;
                await playNext({interaction, client});
            });
            try
            {
                const query = interaction.options.getString("query");
                const queryResults = await ytSearch(query);
                if (!queryResults) return;
                const selectedResult = queryResults.videos[0];
                client.audioPlayer.musicQueue.push(selectedResult);
                embed.setTitle("🎵 Música adicionada à fila")
                .setDescription(`**[${selectedResult.title}](${selectedResult.url})**`)
                .setThumbnail(selectedResult.thumbnail)
                .setFooter({ text: `Solicitada por ${interaction.user.username}` });

                if (!client.audioPlayer.isPlaying) await playNext({interaction, client});
            }
            catch (e)
            {
                throw new Error(e);
            }
        }
        await interaction.editReply({ embeds: [embed] });
    }
};
async function playNext({interaction, client})
{
    const track = client.audioPlayer.musicQueue.shift();
    const ytdlp = await spawn("yt-dlp", ['-f', 'bestaudio[ext=webm]/bestaudio', '-o', '-', '--quiet', '--no-warnings', track.url], { stdio: ['ignore', 'pipe', 'inherit'] });
    await DiscordJSVoiceLib.play(client, ytdlp.stdout);
    const embed = new EmbedBuilder()
    .setTitle("🎵 Tocando agora")
    .setDescription(`**[${track.title}](${track.url})**`)
    .setThumbnail(track.thumbnail)
    interaction.channel.send({ embeds: [embed] });
    client.audioPlayer.isPlaying = true;
}