import path from "path";
import fs from "fs";
import os from "os";
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import process from "process";
import espeakng_export from "../../../../lib/espeakng/index.js";
import discordjsvoice_export from "../../../../lib/discordjs-voice/index.js";

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
    execute: async ({ interaction }) =>
    {
        const embed = new EmbedBuilder();
        await interaction.deferReply();
        {
            const channel = interaction.member.voice.channel;
            const prompt = interaction.options.getString('pergunta');
            const usarWeb = interaction.options.getString('usarweb') === 'true';
            let resposta = '';
            let fontes = [];

            try
            {
                const response = await fetch(process.env.AI_ENDPOINT,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({prompt, usarWeb})
                });

                if (!response.ok) throw new Error(`Status ${response.status}`);
                const data = await response.json();

                resposta = data.resposta !== null ? data.resposta : "";
                fontes = Array.isArray(data.fontes) ? data.fontes : [];
            }
            catch (e)
            {
                console.error(`Erro no comando /pergunta: ${e}`);
                await interaction.editReply('Erro ao gerar resposta da IA.');
                return;
            }
            if (channel)
            {
                try
                {
                    const tempDir = path.resolve(os.tmpdir(), 'thrirebot');
                    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                    const audioPath = path.join(tempDir, `resposta_${interaction.id}.mp3`);

                    await espeakng_export(resposta, audioPath);
                    await discordjsvoice_export(channel, audioPath)
                }
                catch (audioError)
                {
                    console.error('[ÁUDIO] Falha ao gerar ou validar:', audioError);
                    await interaction.editReply('Erro ao gerar áudio da resposta.');
                    return;
                }
            }

            embed.setTitle(`${prompt.trim()}`).setDescription(resposta);
            if (fontes.length > 0) embed.addFields({name: '🔗 Fontes utilizadas', value: fontes.join('\n')});
        }
        await interaction.editReply({ embeds: [embed] });
    },
    autocomplete: async ({ interaction }) => {
        const focused = interaction.options.getFocused(true).value.toLowerCase();
        const name = interaction.options.getFocused(true).name;

        if (name === 'usarweb') {
            const filtered = ['true', 'false']
                .filter(v => v.startsWith(focused))
                .map(v => ({ name: v, value: v }));
            await interaction.respond(filtered);
        }
    }
};