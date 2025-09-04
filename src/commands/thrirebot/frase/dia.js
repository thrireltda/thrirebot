import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { AudioPlayerStatus } from "@discordjs/voice";
import process from "process";
import speakAndPlay from "../../../services/speakAndPlay.js";
import discordJSVoice from "../../../facades/discordJSVoice.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName('dia')
        .setDescription('Busca a frase do dia a partir da API da Thrire.'),
    execute: async ({ interaction, client }) =>
    {
        const embed = new EmbedBuilder();
        await interaction.deferReply();
        {
            await fetch(`${process.env.THRIRE_API}/dailyphrase/dailyphrase`)
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
                embed.setTitle("Frase do dia").setDescription(data.response);
            })
            .catch(console.error);
        }
        await interaction.editReply({ embeds: [embed] });
    }
};