import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Toca uma música")
        .addStringOption(option =>
            option.setName("path")
                .setDescription("Caminho da música")
                .setRequired(true)
        ),

    execute: async ({ interaction }) => {
        await interaction.deferReply();

        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        const query = interaction.options.getString("path");

        const botMember = interaction.guild.members.me;
        if (botMember.voice?.mute) {
            try {
                await botMember.voice.setMute(false);
                console.log('[VOZ] Bot desmutado automaticamente (/play)');
            } catch (err) {
                console.error('[VOZ] Falha ao desmutar o bot:', err);
            }
        }

        try {
            const { track, queue } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: { interaction, requestedBy: interaction.user },
                    stream: true,
                }
            });

            const addedEmbed = new EmbedBuilder()
                .setTitle("🎶 Música adicionada à fila")
                .setDescription(`**[${track.title}](${track.url})**`)
                .setThumbnail(track.thumbnail)
                .setFooter({ text: `Duração: ${track.duration}` });

            await interaction.followUp({ embeds: [addedEmbed] });

            // Se for a única música na fila, quer dizer que vai começar agora
            if (queue.getSize() === 0 && queue.currentTrack === track) {
                const startedEmbed = new EmbedBuilder()
                    .setTitle("▶️ Tocando agora")
                    .setDescription(`**[${track.title}](${track.url})**`)
                    .setThumbnail(track.thumbnail)
                    .setFooter({ text: `Solicitada por ${interaction.user.username}` });

                await interaction.channel.send({ embeds: [startedEmbed] });
            }

        } catch (e) {
            console.error('[ERRO] Falha ao tocar a música:', e);
            return interaction.followUp({ content: "Erro ao tocar a música.", ephemeral: true });
        }
    }
};
