import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Octokit } from 'octokit';

const octokit = new Octokit({auth: process.env.GITHUB_API_KEY,});

export default
{
    data: new SlashCommandBuilder().setName('repos').setDescription('** ADD DESCRIPTION **'),
    execute: async ({client, interaction}) =>
    {
        await octokit.request('GET /orgs/thrireinc/repos')
        .then(async response =>
        {
            let fields = [];
            for (const repo of response.data)
                fields.push({name: repo.name, value: repo.description ?? "Sem descrição disponível.", inline: false});

            const embed = new EmbedBuilder()
            .setTitle("thrire, inc. github repos.")
            .setDescription("lists all available repositories under the thrire, inc. github organization.")
            .addFields(fields);
            await interaction.reply({ embeds: [embed] });
        })
        .catch(async error => await interaction.reply(error));
    },
};