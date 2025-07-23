import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import voiceTimeout from '../../utils/voiceTimeout.js';

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("skip")
        .setDescription("Pula para a próxima música da fila."),

    execute: async ({ client, interaction }) =>
    {
        const queue = client.player.queues.get(interaction.guild.id);

        if (!queue || !queue.isPlaying())
            return interaction.reply({ content: '❌ Nenhuma música está tocando.', ephemeral: true });

        const skipped = queue.node.skip();

        await interaction.deferReply({ ephemeral: true });
        await interaction.deleteReply();

        // Se a fila estiver vazia após o skip, agende a saída
        if (!queue.currentTrack)
        {
            const connection = getVoiceConnection(interaction.guild.id);
            if (connection)
                voiceTimeout(interaction.guild.id, connection);
        }
    }
};
