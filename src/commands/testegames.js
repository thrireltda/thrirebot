// src/commands/testegames.js
import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';

export default {
    data: new SlashCommandBuilder()
        .setName("testegames")
        .setDescription("Força o envio dos jogos gratuitos pagos do dia."),

    execute: async ({ interaction }) => {
        await interaction.deferReply();

        try {
            const res = await fetch('https://www.gamerpower.com/api/giveaways?type=game');
            const giveaways = await res.json();

            const onlyPaid = giveaways.filter(g => g.worth !== "N/A" && g.worth !== "0.00");

            if (onlyPaid.length === 0) {
                return interaction.followUp("❌ Nenhum jogo pago está gratuito hoje.");
            }

            const embed = new EmbedBuilder()
                .setTitle("🎮 Jogos pagos gratuitos hoje!")
                .setColor(0x00AE86)
                .setDescription(
                    onlyPaid.slice(0, 5).map(g =>
                        `• [${g.title}](${g.open_giveaway_url}) — ${g.worth} (${g.platforms})`
                    ).join('\n')
                )
                .setFooter({ text: `Fonte: gamerpower.com` })
                .setTimestamp();

            await interaction.followUp({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.followUp("Erro ao buscar os jogos.");
        }
    }
};
