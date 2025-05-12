import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { useMainPlayer} from 'discord-player';

export default
{
    data: new SlashCommandBuilder().setName("play").setDescription("Plays a song").addStringOption(option =>
    {
        return option.setName("url").setDescription("url of the song").setRequired(true);
    }),
    execute: async ({client, interaction}) =>
    {
        const query = interaction.options.getString("url");
        const player = useMainPlayer();

        // Tocar diretamente com player.play() + nodeOptions
        const result = await player.play(interaction.member.voice.channel, query, {
            nodeOptions: {
                metadata: interaction.channel, // necessário para enviar mensagens depois
                bufferingTimeout: 15000,
                leaveOnEnd: true,
                leaveOnEndCooldown: 300000,
                leaveOnStop: true,
                leaveOnStopCooldown: 300000,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 60000,
                skipOnNoStream: true
            }
        });

        const track = result.track;

        const embed = new EmbedBuilder()
            .setDescription(`Added **[${track.title}](${track.url})** to the queue`)
            .setThumbnail(track.thumbnail)
            .setFooter({ text: `Duration: ${track.duration}` });

        await interaction.reply({ embeds: [embed] });
    }
};