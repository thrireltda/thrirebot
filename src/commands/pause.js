import { SlashCommandBuilder } from '@discordjs/builders';

export default
{
    data: new SlashCommandBuilder().setName("pause").setDescription("Pauses the current playing song."),
    execute: async ({client, interaction}) =>
    {
        const queue = client.player.queues.get(interaction.guild.id);
        if (!queue)
        {
            // Todo: No song playing
            return;
        }

        queue.node.pause();
        await interaction.reply("The current song has been paused");
    }
};