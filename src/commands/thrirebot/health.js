import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import process from "process";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName('health')
        .setDescription('Checa os status das rotas da API.'),
    execute: async ({ interaction, client }) =>
    {
        const embed = new EmbedBuilder();
        await interaction.deferReply();
        {
            await fetch(`${process.env.THRIRE_API}/health`)
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
                embed.setTitle("Thrire API Status");
                for (const route of data.status)
                {
                    let current = "";
                    for (const status of route.status)
                        current += `${status.name}: ${status.value}\n`;
                    embed.addFields
                    ({
                        name: route.route,
                        value: current
                    })
                    embed.addFields
                    ({
                        name: "",
                        value: ""
                    })
                }
            })
            .catch(console.error);
        }
        await interaction.editReply({ embeds: [embed] });
    }
};