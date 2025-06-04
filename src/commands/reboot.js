import { exec } from 'child_process';
import {SlashCommandBuilder} from "@discordjs/builders";
import {EmbedBuilder} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("reboot")
        .setDescription("Reboots the server"),
    execute: async ({ interaction }) => {
        const embed = new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle('🔄 Reiniciando servidor...')
            .setDescription('O servidor será reiniciado em instantes.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        setTimeout(() => {
            exec('sudo /sbin/reboot', (error) => {
                if (error)
                    console.error(`Erro ao reiniciar: ${error.message}`);
            });
        }, 2000);
    }
};