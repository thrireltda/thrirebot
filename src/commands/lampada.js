import { exec } from 'child_process';
import {SlashCommandBuilder} from "@discordjs/builders";
import {EmbedBuilder} from "discord.js";

const HUE_BRIDGE_IP = '192.168.1.100'; // << seu IP real
const HUE_USERNAME = 'XFBXEqFoaaUZMK4nOPSgCUJCMu1XvkvOZrXroekj'; // << seu token de autenticação local
const LIGHT_ID = '3';

export default
{
    data: new SlashCommandBuilder().setName("lampada").setDescription("Liga ou desliga a lâmpada").addStringOption(option =>
    option.setName("estado")
    .setDescription("on ou off")
    .setRequired(true)
    .addChoices
    (
        { name: "Ligar", value: "on" },
        { name: "Desligar", value: "off" })),
    execute: async ({ client, interaction }) =>
    {
        const estado = interaction.options.getString("estado") === "on";
        const action = estado ? "ligando" : "desligando";

        const embed = new EmbedBuilder()
        .setColor(estado ? 0x00cc66 : 0xcc0000)
        .setTitle(`💡 ${estado ? 'Ligando' : 'Desligando'} lâmpada...`)
        .setDescription(`A lâmpada será ${estado ? 'ligada' : 'desligada'} em instantes.`)
        .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        try {
            const res = await fetch(`http://${HUE_BRIDGE_IP}/api/${HUE_USERNAME}/lights/${LIGHT_ID}/state`, {
                method: "PUT",
                body: JSON.stringify({ on: estado })
            });

            if (!res.ok) {
                console.error(await res.text());
                return;
            }
        } catch (err) {
            console.error("Erro ao controlar a lâmpada:", err);
        }
    }
};