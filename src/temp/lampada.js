import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";

const HUE_BRIDGE_IP = '192.168.1.100';
const HUE_USERNAME = 'XFBXEqFoaaUZMK4nOPSgCUJCMu1XvkvOZrXroekj';

export default {
    data: new SlashCommandBuilder()
        .setName("lampada")
        .setDescription("Controla uma lâmpada inteligente")
        .addSubcommand(subcommand =>
            subcommand
                .setName("estado")
                .setDescription("Liga ou desliga a lâmpada")
                .addIntegerOption(option =>
                    option
                        .setName("id")
                        .setDescription("ID da lâmpada")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("estado")
                        .setDescription("Escolha o estado da lâmpada")
                        .setRequired(true)
                        .addChoices(
                            { name: "Ligar", value: "on" },
                            { name: "Desligar", value: "off" }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("status")
                .setDescription("Mostra o status atual da lâmpada")
                .addIntegerOption(option =>
                    option
                        .setName("id")
                        .setDescription("ID da lâmpada")
                        .setRequired(true)
                )
        ),

    execute: async ({ interaction }) => {
        const subcommand = interaction.options.getSubcommand();
        const lightId = interaction.options.getInteger("id");

        if (subcommand === "status") {
            try {
                const res = await fetch(`http://${HUE_BRIDGE_IP}/api/${HUE_USERNAME}/lights/${lightId}`);
                const data = await res.json();
                const ligada = data.state?.on;

                const embed = new EmbedBuilder()
                    .setColor(ligada ? 0x00cc66 : 0xcc0000)
                    .setTitle("💡 Status da Lâmpada")
                    .setDescription(`A lâmpada ${lightId} está **${ligada ? "ligada" : "desligada"}**.`)
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed] });
            } catch (err) {
                console.error("Erro ao consultar status:", err);
                return await interaction.reply({ content: "❌ Erro ao consultar status da lâmpada.", ephemeral: true });
            }
        }

        if (subcommand === "estado") {
            const estado = interaction.options.getString("estado") === "on";

            const embed = new EmbedBuilder()
                .setColor(estado ? 0x00cc66 : 0xcc0000)
                .setTitle(`💡 ${estado ? "Ligando" : "Desligando"} lâmpada ${lightId}...`)
                .setDescription(`A lâmpada será ${estado ? "ligada" : "desligada"} em instantes.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            try {
                const res = await fetch(`http://${HUE_BRIDGE_IP}/api/${HUE_USERNAME}/lights/${lightId}/state`, {
                    method: "PUT",
                    body: JSON.stringify({ on: estado }),
                });

                if (!res.ok) {
                    console.error(await res.text());
                }
            } catch (err) {
                console.error("Erro ao controlar a lâmpada:", err);
            }
        }
    }
};
