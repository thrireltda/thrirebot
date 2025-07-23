import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import fetch from 'node-fetch';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Toca uma música")
        .addStringOption(option =>
            option.setName("path")
                .setDescription("Caminho da música (link ou nome)")
                .setRequired(true)
        ),

    execute: async ({ interaction }) => {
        await interaction.deferReply();
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        const query = interaction.options.getString("path");

        let lyrics = [];
        let selectedTrack = null;
        let usedFallback = false;

        try {
            const searchResult = await player.search(query, { requestedBy: interaction.user });
            if (!searchResult || !searchResult.tracks.length)
                return interaction.followUp({ content: 'Música não encontrada.', ephemeral: true });

            selectedTrack = searchResult.tracks[0];

            const cleanedTitle = selectedTrack.title.replace(/\([^)]*\)|\[[^\]]*\]|- .*|feat\..*/gi, '').trim();
            const cleanedAuthor = selectedTrack.author.replace(/\([^)]*\)|\[[^\]]*\]/gi, '').trim();

            // 🎯 Tentativa 1: LRCLib (sincronizada)
            const resLrc = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanedTitle)}&artist_name=${encodeURIComponent(cleanedAuthor)}`);
            const dataLrc = await resLrc.json();

            if (dataLrc?.syncedLyrics) {
                lyrics = dataLrc.syncedLyrics.split('\n').map(line => {
                    const [time, text] = line.split(']');
                    return {
                        time: time.replace('[', '').trim(),
                        seconds: convertTimeToSeconds(time),
                        text: text?.trim() || ''
                    };
                });
            }

            // 🎯 Tentativa 2: Vagalume (fallback não sincronizado)
            if (!lyrics.length) {
                const fallbackUrl = `https://api.vagalume.com.br/search.artmus?q=${encodeURIComponent(cleanedAuthor + ' ' + cleanedTitle)}&limit=1`;
                const fallbackRes = await fetch(fallbackUrl);
                const fallbackData = await fallbackRes.json();

                if (fallbackData.response?.docs?.[0]?.url) {
                    const slug = fallbackData.response.docs[0].url.replace('/', '').replace('.html', '');
                    const lyricRes = await fetch(`https://api.vagalume.com.br${fallbackData.response.docs[0].url}.json`);
                    const lyricData = await lyricRes.json();

                    if (lyricData?.mus?.[0]?.text) {
                        lyrics = lyricData.mus[0].text
                            .split('\n')
                            .map((line, i) => ({
                                time: '',
                                seconds: i * 3, // aproximação grosseira
                                text: line.trim()
                            }));
                        usedFallback = true;
                    }
                }
            }

            // 🎵 Embed inicial
            const preview = lyrics.length
                ? lyrics.slice(0, 8).map((line, i) => line.text ? (i === 0 ? `**${line.text}**` : line.text) : '').join('\n')
                : 'Letra não encontrada.';

            const embed = new EmbedBuilder()
                .setTitle("🎶 Tocando agora")
                .setDescription(`**[${selectedTrack.title}](${selectedTrack.url})**\n\n${preview}`)
                .setThumbnail(selectedTrack.thumbnail)
                .setFooter({ text: `Solicitada por ${interaction.user.username}` });

            const reply = await interaction.followUp({ embeds: [embed] });

            // 🎧 Toca a música depois que a letra estiver carregada
            const { track, queue } = await player.play(channel, selectedTrack.url, {
                nodeOptions: {
                    metadata: { interaction, requestedBy: interaction.user },
                    leaveOnEnd: false,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 5 * 60_000,
                }
            });

            if (lyrics.length > 0) {
                const startTime = Date.now();
                let windowStart = 0;
                const maxLines = 8;
                const boldIndexes = new Set();
                let fixedWindow = false;

                const loop = async () => {
                    const secondsNow = (Date.now() - startTime) / 1000;
                    const currentIndex = lyrics.findIndex((line, i) => {
                        const next = lyrics[i + 1];
                        return secondsNow >= line.seconds && (!next || secondsNow < next.seconds);
                    });

                    if (currentIndex !== -1) {
                        boldIndexes.add(currentIndex);

                        const nextLineIndex = windowStart + maxLines;
                        const hasLineToAdd = lyrics[nextLineIndex] !== undefined;

                        if (!fixedWindow && hasLineToAdd && currentIndex >= windowStart + 1) {
                            windowStart++;
                        }

                        if (!hasLineToAdd && !fixedWindow) {
                            fixedWindow = true;
                        }

                        const visible = lyrics.slice(windowStart, windowStart + maxLines);
                        const embedText = visible.map((line, i) => {
                            const actualIndex = windowStart + i;
                            if (!line.text) return ''; // evita "**"
                            return boldIndexes.has(actualIndex) ? `**${line.text}**` : line.text;
                        }).join('\n');

                        embed.setDescription(`**[${track.title}](${track.url})**\n\n${embedText}`);
                        await reply.edit({ embeds: [embed] });
                    }

                    if (queue.currentTrack) {
                        setTimeout(loop, 500);
                    }
                };

                loop();
            }

        } catch (e) {
            console.error('[ERRO] Falha ao tocar a música ou buscar letra:', e);
            return interaction.followUp({ content: "Erro ao tocar a música ou buscar letra.", ephemeral: true });
        }
    }
};

function convertTimeToSeconds(str) {
    const [min, sec] = str.replace('[', '').split(':');
    return parseFloat(min) * 60 + parseFloat(sec);
}
