import { SlashCommandBuilder } from '@discordjs/builders';

export default
{
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Para a música e limpa a fila."),
    execute: async ({client, interaction}) =>
    {
        const queue = await client.player.queues.get(interaction.guild.id);
        if (!queue)
        {
            await interaction.reply({ content: 'Nenhuma música tocando.', ephemeral: true });
            return;
        }

        queue.clear();
        queue.node.stop();

        await interaction.deferReply();
        await interaction.deleteReply();
    }
};