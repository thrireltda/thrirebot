import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("stop")
        .setDescription("Para a rádio e desconecta do canal de voz."),
    execute: async ({ interaction }) =>
    {
        try
        {
            const connection = getVoiceConnection(interaction.guild.id);
            if (!connection) return interaction.reply({content: "❌ Nenhuma rádio está tocando.", flags: 64});
            try
            {
                connection.destroy();
            }
            catch (e)
            {
                throw new Error(`Conexão já encerrada ou inválida: ${e}`)
            }
            await interaction.reply({ content: "🛑 Rádio parada.", flags: 64 });
            setTimeout(() =>
            {
                interaction.deleteReply().catch(() => {});
            }, 1500);
        }
        catch (e)
        {
            throw new Error(`Erro inesperado: ${e}`)
        }
    }
};