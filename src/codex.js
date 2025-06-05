import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { Octokit } from 'octokit';

export default {
    data: new SlashCommandBuilder()
        .setName('codex')
        .setDescription('Gera código e cria PRs automaticamente.')
        .addStringOption(option =>
            option
                .setName('descricao')
                .setDescription('Descrição do que deve ser gerado ou modificado.')
                .setRequired(true)
        ),
    execute: async ({ interaction }) => {
        const prompt = interaction.options.getString('descricao');
        await interaction.deferReply();

        const owner = process.env.PR_REPO_OWNER || 'thrireinc';
        const repo = process.env.PR_REPO_NAME || 'thrirebot';
        const octokit = new Octokit({ auth: process.env.GITHUB_BOT_API_KEY || process.env.GITHUB_API_KEY });

        const commandMatch = prompt.match(/^\/(\w+)/);

        try {
            const { data: repoData } = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });
            const baseBranch = repoData.default_branch;
            const { data: baseRef } = await octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
                owner,
                repo,
                ref: `heads/${baseBranch}`
            });

            const branchName = `codex-${Date.now()}`;
            await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
                owner,
                repo,
                ref: `refs/heads/${branchName}`,
                sha: baseRef.object.sha
            });

            let commitMessage;
            let prBody;

            if (commandMatch) {
                const commandName = commandMatch[1];
                const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'Você gera código em JavaScript para comandos do thrirebot. Responda apenas com o conteúdo do arquivo.' },
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.2
                    })
                });

                if (!openAiRes.ok) {
                    console.error(await openAiRes.text());
                    return await interaction.followUp('Erro ao comunicar com o Codex.');
                }

                const codeData = await openAiRes.json();
                let fileContent = codeData.choices?.[0]?.message?.content || '';
                if (!fileContent) {
                    return await interaction.followUp('O Codex não retornou nenhuma resposta.');
                }

                fileContent = fileContent.replace(/```[\s\S]*?```/g, match => match.replace(/```(?:javascript)?\n?|```/g, '')).trim();

                const filePath = `src/commands/${commandName}.js`;
                commitMessage = `Codex comando: ${commandName}`;
                prBody = 'Comando gerado automaticamente pelo Codex.';

                await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                    owner,
                    repo,
                    path: filePath,
                    message: commitMessage,
                    content: Buffer.from(fileContent).toString('base64'),
                    branch: branchName,
                    committer: { name: 'thrirebot', email: 'bot@thrire.com' },
                    author: { name: 'thrirebot', email: 'bot@thrire.com' }
                });
            } else {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'Você gera patches de código para o projeto thrirebot. Responda apenas com o diff do git.' },
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
                const patch = data.choices?.[0]?.message?.content?.trim();
                if (!patch) {
                    return await interaction.followUp('O Codex não retornou nenhuma resposta.');
                }

                const path = `codex-patches/${branchName}.patch`;
                commitMessage = `Codex patch: ${prompt}`;
                prBody = 'Patch gerado automaticamente pelo Codex.';

                await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                    owner,
                    repo,
                    path,
                    message: commitMessage,
                    content: Buffer.from(patch).toString('base64'),
                    branch: branchName,
                    committer: { name: 'thrirebot', email: 'bot@thrire.com' },
                    author: { name: 'thrirebot', email: 'bot@thrire.com' }
                });
            }

            const prResponse = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
                owner,
                repo,
                title: commitMessage,
                head: branchName,
                base: baseBranch,
                body: prBody
            });

            const embed = new EmbedBuilder()
                .setTitle('Pull request criada')
                .setDescription(`[Clique aqui para ver a PR](${prResponse.data.html_url})`);

            await interaction.followUp({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.followUp('Erro ao processar a requisição do Codex.');
        }
    }
};
