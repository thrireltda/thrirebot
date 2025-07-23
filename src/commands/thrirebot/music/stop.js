import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import voiceTimeout from '../../../utils/voiceTimeout.js';

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("stop")
        .setDescription("Para a música e limpa a fila."),
    execute: async ({ client, interaction }) =>
    {
        const queue = client.player.queues.get(interaction.guild.id);

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: '❌ Nenhuma música está tocando.', ephemeral: true });

        queue.clear();
        queue.node.stop();

        await interaction.deferReply({ ephemeral: true });
        await interaction.deleteReply();

        const connection = getVoiceConnection(interaction.guild.id);
        if (connection)
            voiceTimeout(interaction.guild.id, connection);
    }
};