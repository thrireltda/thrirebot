const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =
{
    data: new SlashCommandBuilder().setName("resume").setDescription("Resumes the current playing song."),
    execute: async ({client, interaction}) =>
    {
        const queue = client.player.queues.get(interaction.guild.id);
        if (!queue)
        {
            // Todo: No song playing
            return;
        }

        queue.node.resume();
        await interaction.reply("The current song has been resumed.");
    }
};