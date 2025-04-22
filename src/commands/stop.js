const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports =
{
    data: new SlashCommandBuilder().setName("stop").setDescription("Stops the current playing song."),
    execute: async ({client, interaction}) =>
    {
        const queue = client.player.queues.get(interaction.guild.id);
        if (!queue)
        {
            // Todo: No song playing
            return;
        }

        queue.node.stop();
        await interaction.reply("Bye bye.");
    }
};