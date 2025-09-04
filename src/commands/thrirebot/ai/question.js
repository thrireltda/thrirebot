import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { AudioPlayerStatus } from "@discordjs/voice";
import process from "process";
import speakAndPlay from "../../../services/speakAndPlay.js";
import discordJSVoice from "../../../facades/discordJSVoice.js";

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
        await interaction.deferReply();
        {
            const prompt = interaction.options.getString('pergunta');
            const usarWeb = interaction.options.getString('usarweb') === 'true';
            await fetch(`${process.env.THRIRE_API}/askquestion`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({prompt, usarWeb})
            })
            .then(response =>
            {
                switch (response.ok)
                {
                    case true:
                        return response.json();
                    case false:
                        throw new Error("Network response was not ok.");
                }
            })
            .then(async data =>
            {
                if (discordJSVoice.getStatus(client) === AudioPlayerStatus.Idle)
                    await speakAndPlay(client, data.response);
                embed.setTitle(`P: ${prompt.trim()}`).setDescription(`R: ${data.response}`);
                if (data.sources)
                    embed.addFields({name: '🔗 Fontes utilizadas', value: data.sources.join('\n')});
            })
            .catch(console.error);
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