import path from "path";
import fs from "fs";
import os from "os";
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import process from "process";
import speakAndPlay from "../../../services/speakAndPlay.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName('question')
        .setDescription('Faça uma pergunta para o GPT.')
        .addStringOption(option =>
            option.setName('pergunta')
                .setDescription('A pergunta em si.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('usarweb')
                .setDescription('Buscar fatos na web?')
                .setAutocomplete(true)
                .setRequired(false)
        ),
    execute: async ({ interaction, client }) =>
    {
        const embed = new EmbedBuilder();
        interaction.deferReply();
        {
            const prompt = interaction.options.getString('pergunta');
            const usarWeb = interaction.options.getString('usarweb') === 'true';
            const response = await fetch(process.env.AI_ENDPOINT,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({prompt, usarWeb})
            });
            try
            {
                const data = await response.json();
                await speakAndPlay(client, data.resposta);
                embed.setTitle(`${prompt.trim()}`).setDescription(data.resposta);
                if (data.fontes.length > 0) embed.addFields({name: '🔗 Fontes utilizadas', value: data.fontes.join('\n')});
            }
            catch (e)
            {
                throw new Error(e);
            }
        }
        await interaction.editReply({ embeds: [embed] });
    },
    autocomplete: async ({ interaction }) =>
    {
        const focused = interaction.options.getFocused(true).value.toLowerCase();
        const name = interaction.options.getFocused(true).name;
        switch (name)
        {
            case 'usarweb':
                const filtered = ['true', 'false'].filter(v => v.startsWith(focused)).map(v => ({ name: v, value: v }));
                await interaction.respond(filtered);
                break;
        }
    }
};