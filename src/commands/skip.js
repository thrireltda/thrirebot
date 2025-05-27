import { SlashCommandBuilder } from '@discordjs/builders';

export default
{
    data: new SlashCommandBuilder().setName("skip").setDescription("skips the current playing song"),
    execute: async ({client, interaction}) =>
    {
        const queue = await client.player.queues.get(interaction.guild.id);
        if (!queue) return;
        queue.node.skip();

        await interaction.deferReply();
        await interaction.deleteReply();
    }
};