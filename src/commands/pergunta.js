import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';

export default {
    data: new SlashCommandBuilder()
        .setName('pergunta')
        .setDescription('Envie uma pergunta para a IA e receba uma resposta.')
        .addStringOption(option =>
            option
                .setName('descricao')
                .setDescription('Descrição do que deve ser gerado ou modificado.')
                .setRequired(true)
        ),
    execute: async ({ interaction }) => {
        const prompt = interaction.options.getString('descricao');
        await interaction.deferReply();

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.2
                })
            });

            if (!res.ok) {
                console.error(await res.text());
                return await interaction.followUp('Erro ao comunicar com o Codex.');
            }

            const data = await res.json();
            const text = data.choices?.[0]?.message?.content?.trim();
            if (!text) {
                return await interaction.followUp('O Codex não retornou nenhuma resposta.');
            }

            const embed = new EmbedBuilder()
                .setTitle('Resposta da IA')
                .setDescription(text.slice(0, 4096));

            await interaction.followUp({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.followUp('Erro ao processar a requisição do Codex.');
        }
    }
};
