import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName("stop")
        .setDescription("Para a rádio e desconecta do canal de voz."),

    execute: async ({ interaction }) => {
        try {
            const connection = getVoiceConnection(interaction.guild.id);

            if (!connection) {
                return interaction.reply({
                    content: "❌ Nenhuma rádio está tocando.",
                    flags: 64
                });
            }

            // 🔹 Para e desconecta imediatamente (sem esperar nada)
            try {
                connection.destroy();
            } catch (err) {
                console.warn("[RADIO STOP] Conexão já encerrada ou inválida.");
            }

            await interaction.reply({ content: "🛑 Rádio parada.", flags: 64 });

            // Remove a mensagem rapidamente, mas sem quebrar caso não seja possível
            setTimeout(() => {
                interaction.deleteReply().catch(() => {});
            }, 1500);

        } catch (err) {
            console.error("[RADIO STOP] Erro inesperado:", err);
            // Falha segura: responde privado sem travar o bot
            if (!interaction.replied) {
                interaction.reply({
                    content: "⚠️ Ocorreu um erro ao tentar parar a rádio.",
                    flags: 64
                }).catch(() => {});
            }
        }
    }
};