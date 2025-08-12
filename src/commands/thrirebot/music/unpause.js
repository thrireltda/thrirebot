import { SlashCommandBuilder } from '@discordjs/builders';

export default
{
    data: new SlashCommandBuilder()
        .setName("unpause")
        .setDescription("Retoma a música pausada."),
    execute: async ({client, interaction}) =>
    {
        const queue = await client.player.queues.get(interaction.guild.id);
        if (!queue) return;
        if (queue.node.isPaused()) queue.node.resume();
        await interaction.deferReply();
        await interaction.deleteReply();
    }
};