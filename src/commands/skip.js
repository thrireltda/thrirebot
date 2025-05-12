import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

export default
{
    data: new SlashCommandBuilder().setName("skip").setDescription("Skips the current playing song."),
    execute: async ({client, interaction}) =>
    {
        const queue = client.player.queues.get(interaction.guild.id);
        if (!queue)
        {
            // Todo: No song playing
            return;
        }

        const song = queue.currentTrack;
        queue.node.skip();

        let embed = new EmbedBuilder()
        .setDescription(`Skipped **${song.title}`)
        .setThumbnail(song.thumbnail)
        await interaction.reply({embeds: [embed]});
    }
};