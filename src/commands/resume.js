import { SlashCommandBuilder } from '@discordjs/builders';

export default
{
    data: new SlashCommandBuilder().setName("resume").setDescription("resumes the current playing song"),
    execute: async ({client, interaction}) =>
    {
        const queue = await client.player.queues.get(interaction.guild.id);
        if (!queue) return;
        queue.node.resume();

        await interaction.deferReply();
        await interaction.deleteReply();
    }
};