import { exec } from 'child_process';
import {SlashCommandBuilder} from "@discordjs/builders";
import {EmbedBuilder} from "discord.js";

export default
{
    data: new SlashCommandBuilder().setName("reboot").setDescription("Reboots the server"),
    execute: async ({client, interaction}) =>
    {
        const embed = new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle('🔄 Reiniciando servidor...')
            .setDescription('O servidor será reiniciado em instantes.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Aguarda 2 segundos para garantir que a resposta seja enviada antes do reboot
        setTimeout(() => {
            exec('sudo /sbin/reboot', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao reiniciar: ${error.message}`);
                    // ⚠️ Não tente usar interaction aqui — a resposta já foi enviada e o processo pode encerrar
                }
            });
        }, 2000); // tempo seguro para evitar travar a resposta
    }
};