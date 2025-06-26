import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from "discord.js";
import { promisify } from "util";
import { exec } from "child_process";
import { decrypt } from "../../../utils/crypto.js";
import { Octokit } from "@octokit/rest";
import fs from "fs/promises";

const execAsync = promisify(exec);

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName("cb")
        .setDescription("Muda o branch atual do thrirebot")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("Nome do branch")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    execute: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        const branch = interaction.options.getString("name");
        const cwd = process.cwd();
        const userId = interaction.user.id;

        try {
            const raw = await fs.readFile('./github_credentials.json', 'utf8');
            const credentials = JSON.parse(raw);
            const token = decrypt(credentials[userId]?.token);
            if (!token) throw new Error("Token GitHub não encontrado para este usuário.");

            // Troca de branch + pull com token dinâmico
            await execAsync(`git checkout ${branch}`, { cwd });
            await execAsync(`git pull https://x-access-token:${token}@github.com/thrireltda/thrirebot.git`, { cwd });

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Branch trocado com sucesso")
                .setDescription(`Agora usando o branch \`${branch}\` no repositório \`thrirebot\`. Reiniciando...`)
                .setColor(0x2ecc71);

            await interaction.editReply({ embeds: [successEmbed] });
            process.exit(0);

        } catch (error) {
            console.error("❌ Erro ao trocar o branch:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Erro ao trocar o branch")
                .setDescription(`Detalhes: \`${error.message}\``)
                .setColor(0xcc0000);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    autocomplete: async ({ interaction }) => {
        const focusedOption = interaction.options.getFocused(true);
        const userId = interaction.user.id;

        try {
            const raw = await fs.readFile('./github_credentials.json', 'utf8');
            const credentials = JSON.parse(raw);
            const token = decrypt(credentials[userId]?.token);
            if (!token) return;

            const octokit = new Octokit({ auth: token });
            const response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
                owner: 'thrireltda',
                repo: 'thrirebot'
            });

            const branches = response.data.map(b => b.name);
            const filtered = branches
                .filter(branch => branch.includes(focusedOption.value))
                .slice(0, 25)
                .map(branch => ({ name: branch, value: branch }));

            await interaction.respond(filtered);
        } catch (error) {
            console.error("Erro no autocomplete:", error);
            await interaction.respond([]);
        }
    }
};
