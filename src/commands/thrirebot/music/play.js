import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { QueryType, useMainPlayer } from 'discord-player';
import safelyEncode from "../../../utils/safelyEncode.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Toca uma música")
        .addStringOption(option =>
            option.setName("path")
                .setDescription("Caminho da música (link ou nome)")
                .setRequired(true)
        ),
    execute: async ({ interaction }) =>
    {
        await interaction.deferReply();
        {
            const channel = interaction.member.voice.channel;
            if (!channel) return interaction.followUp({ content: "Você precisa estar em um canal de voz.", ephemeral: true });
            const existingConnection = getVoiceConnection(interaction.guild.id);
            if (existingConnection) existingConnection.destroy();

            try
            {
                const player = useMainPlayer();
                const query = interaction.options.getString("path");
                const searchResult = await player.search(query,
                {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_SEARCH
                });
                if (!searchResult || !searchResult.tracks.length) return interaction.followUp({ content: 'Música não encontrada.', ephemeral: true });
                const selectedTrack = searchResult.tracks[0];

                const addedEmbed = new EmbedBuilder()
                .setTitle("Música adicionada à fila")
                .setDescription(`**[${selectedTrack.title}](${selectedTrack.url})**`)
                .setThumbnail(selectedTrack.thumbnail)
                .setFooter({ text: `Solicitada por ${interaction.user.username}` });
                await interaction.followUp({ embeds: [addedEmbed] });

                const { track, queue } = await player.play(channel, selectedTrack.url, {
                    nodeOptions: {
                        metadata: { interaction, requestedBy: interaction.user },
                        leaveOnEnd: false,
                        leaveOnEmpty: true,
                        leaveOnEmptyCooldown: 5 * 60_000,
                    }
                });
                const waitUntilPlaying = async () =>
                {
                    return new Promise(resolve =>
                    {
                        const check = () =>
                        {
                            if (queue.currentTrack?.url === track.url)
                                resolve();
                            else
                                setTimeout(check, 500);
                        };
                        check();
                    });
                };
                await waitUntilPlaying();
                const lyrics = await fetchLyrics(track.title, track.author);

                const embed = new EmbedBuilder()
                .setTitle("Tocando agora")
                .setDescription(`**[${track.title}](${track.url})**\n\n${lyrics.length ? lyrics.slice(0, 8).map(l => l.text).join('\n') : 'Letra não encontrada.'}`)
                .setThumbnail(track.thumbnail)
                .setFooter({ text: `Solicitada por ${interaction.user.username}` });
                const embedMessage = await interaction.channel.send({ embeds: [embed] });

                if (lyrics.length > 0)
                {
                    const startTime = Date.now();
                    let windowStart = 0;
                    const maxLines = 8;
                    const boldIndexes = new Set();
                    let fixedWindow = false;
                    const loop = async () =>
                    {
                        const secondsNow = (Date.now() - startTime) / 1000;
                        const currentIndex = lyrics.findIndex((line, i) => {
                            const next = lyrics[i + 1];
                            return secondsNow >= line.seconds && (!next || secondsNow < next.seconds);
                        });
                        if (currentIndex !== -1)
                        {
                            boldIndexes.add(currentIndex);
                            const nextLineIndex = windowStart + maxLines;
                            const hasLineToAdd = lyrics[nextLineIndex] !== undefined;
                            if (!fixedWindow && hasLineToAdd && currentIndex >= windowStart + 1) windowStart++;
                            if (!hasLineToAdd && !fixedWindow) fixedWindow = true;
                            const visible = lyrics.slice(windowStart, windowStart + maxLines);
                            const embedText = visible.map((line, i) =>
                            {
                                const actualIndex = windowStart + i;
                                if (!line.text) return '';
                                return boldIndexes.has(actualIndex) ? `**${line.text}**` : line.text;
                            }).join('\n');
                            embed.setDescription(`**[${track.title}](${track.url})**\n\n${embedText}`);
                            await embedMessage.edit({ embeds: [embed] });
                        }
                        if (queue.currentTrack && queue.currentTrack.url === track.url) setTimeout(loop, 750);
                    };
                    loop();
                }
            }
            catch (e)
            {
                throw new Error(`Falha ao tocar a música ou buscar letra: ${e}`)
            }
        }
    }
};

function convertTimeToSeconds(str)
{
    const [min, sec] = str.replace('[', '').split(':');
    return parseFloat(min) * 60 + parseFloat(sec);
}
function fixAuthorName(name)
{
    return /^(?:[A-Z] ?)+$/.test(name.trim()) ? name.replace(/\s+/g, '') : name;
}
async function fetchLyrics(title, author)
{
    try
    {
        const trackName = safelyEncode(String(title));
        const artistName = safelyEncode(fixAuthorName(String(author).trim()));
        const lrcUrl = `https://lrclib.net/api/get?track_name=${trackName}&artist_name=${artistName}`;
        const resLrc = await fetch(lrcUrl);
        const dataLrc = await resLrc.json();
        if (!dataLrc?.syncedLyrics) return [];
        return dataLrc.syncedLyrics.split('\n').map(line =>
        {
            const [time, text] = line.split(']');
            return {time: time.replace('[', '').trim(), seconds: convertTimeToSeconds(time), text: text?.trim() || ''};
        });

    }
    catch (e)
    {
        return [];
    }
}
