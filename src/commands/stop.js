import { SlashCommandBuilder } from '@discordjs/builders';

export default
{
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Para a música e limpa a fila."),
    execute: async ({ client, interaction }) =>
    {
        const queue = client.player.queues.get(interaction.guild.id);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ Nenhuma música está tocando.', ephemeral: true });
        queue.clear();
        queue.node.stop();
        await interaction.deferReply({ ephemeral: true });
        await interaction.deleteReply();
    }
};