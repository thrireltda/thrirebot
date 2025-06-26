import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Toca uma música")
        .addStringOption(option =>
            option.setName("path")
                .setDescription("Caminho da música")
                .setRequired(true)
        ),
    execute: async ({ interaction }) =>
    {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        const query = interaction.options.getString("path");

        await interaction.deferReply();
        try
        {
            const {track} = await player.play(channel, query, {nodeOptions: {
                    metadata: interaction,
                    stream: true,
                }});

            const embed = new EmbedBuilder().setDescription(`**[${track.title}](${track.url})** adicionada à fila.`).setThumbnail(track.thumbnail).setFooter({text: `Duração: ${track.duration}` });
            return interaction.followUp({ embeds: [embed] });
        }
        catch (e)
        {
            // let's return error if something failed
            return interaction.followUp(e);
        }
    }
};