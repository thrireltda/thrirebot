import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_API_KEY });

let repoChoices = [];
try {
    const response = await octokit.request('GET /orgs/thrireinc/repos');
    repoChoices = response.data.map(repo => ({ name: repo.name, value: repo.name })).slice(0, 25);
} catch (error) {
    console.error('Erro ao carregar repositórios:', error);
}

export default {
    data: new SlashCommandBuilder()
        .setName('pulls')
        .setDescription('Lista as pull requests abertas de um reposit\u00f3rio.')
        .addStringOption(option => {
            option
                .setName('repo')
                .setDescription('Reposit\u00f3rio no formato owner/nome ou apenas nome para repos da thrireinc')
                .setRequired(true);
            if (repoChoices.length > 0) {
                option.addChoices(...repoChoices);
            }
            return option;
        }),
    execute: async ({ interaction }) => {
        const input = interaction.options.getString('repo');
        const [owner, repo] = input.includes('/') ? input.split('/') : ['thrireinc', input];

        try {
            const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
                owner,
                repo,
                state: 'open'
            });

            const fields = response.data.map(pr => ({
                name: `#${pr.number} ${pr.title}`,
                value: pr.html_url,
                inline: false
            }));

            if (fields.length === 0) {
                fields.push({ name: 'Nenhuma PR encontrada.', value: '\u200B', inline: false });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Pull requests de ${owner}/${repo}`)
                .addFields(fields);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply('Erro ao buscar pull requests.');
        }
    }
};
