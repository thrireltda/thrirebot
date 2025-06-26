import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { Octokit } from "@octokit/rest";
import { readFile } from "fs/promises";
import { decrypt } from "../../../utils/crypto.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName("approve")
        .setDescription("Aprova uma pull request")
        .addStringOption(option =>
            option.setName("repo")
                .setAutocomplete(true)
                .setDescription("Repositório")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("pr")
                .setAutocomplete(true)
                .setDescription("Número da PR")
                .setRequired(true)
        ),

    execute: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const repo = interaction.options.getString("repo");
        const prNumber = parseInt(interaction.options.getString("pr"));

        try {
            const raw = await readFile("./github_credentials.json", "utf8");
            const credentials = JSON.parse(raw);
            if (!credentials[userId]) {
                return interaction.editReply({
                    content: "❌ Token do GitHub não encontrado para este usuário."
                });
            }

            const token = decrypt(credentials[userId].token);
            const octokit = new Octokit({ auth: token });

            // 🔍 Buscar dados da PR para capturar o nome do branch
            const { data: prData } = await octokit.pulls.get({
                owner: "thrireltda",
                repo,
                pull_number: prNumber
            });

            const prBranch = prData.head.ref;

            // ✅ Aprovar a PR
            await octokit.pulls.createReview({
                owner: "thrireltda",
                repo,
                pull_number: prNumber,
                event: "APPROVE"
            });

            const embed = new EmbedBuilder()
                .setTitle("✅ Pull Request aprovada")
                .setDescription(`PR \`#${prNumber}\` do repositório \`${repo}\` foi aprovada.`)
                .setColor(0x2ecc71);

            await interaction.editReply({ embeds: [embed] });

            // 🔄 Trocar para a branch dev se necessário
            try {
                const { stdout: currentBranch } = await execAsync("git rev-parse --abbrev-ref HEAD");
                if (currentBranch.trim() !== "dev") {
                    console.log(`📦 Branch atual: ${currentBranch.trim()} — trocando para dev...`);
                    await execAsync("git checkout dev");
                    await execAsync(`git pull https://x-access-token:${token}@github.com/thrireltda/${repo}.git`);
                    console.log("✅ Bot voltou para a branch dev");
                } else {
                    console.log("ℹ️ Já estamos na branch dev.");
                }
            } catch (err) {
                console.error("❌ Erro ao trocar para a branch dev:", err);
            }

            // 🧹 Remover branch local da PR se existir
            try {
                const { stdout: localBranches } = await execAsync("git branch");
                const localBranchList = localBranches
                    .split("\n")
                    .map(b => b.trim().replace("* ", ""));
                if (localBranchList.includes(prBranch)) {
                    console.log(`🗑️ Apagando branch local '${prBranch}'...`);
                    await execAsync(`git branch -D ${prBranch}`);
                    console.log(`✅ Branch '${prBranch}' removido localmente.`);
                } else {
                    console.log(`ℹ️ Branch '${prBranch}' não existe localmente.`);
                }
            } catch (err) {
                console.error("❌ Erro ao apagar o branch local:", err);
            }

            // ♻️ Reiniciar o processo (systemd relança)
            console.log("♻️ Encerrando processo para reinício via systemd...");
            process.exit(0);

        } catch (error) {
            console.error("Erro ao aprovar PR:", error);
            return interaction.editReply({
                content: "❌ Não foi possível aprovar a PR. Verifique o número ou as permissões.",
            });
        }
    },

    autocomplete: async ({ interaction }) => {
        const userId = interaction.user.id;
        const focused = interaction.options.getFocused(true);
        const focusedName = focused.name;
        const query = focused.value.toLowerCase();

        let token;
        try {
            const raw = await readFile("./github_credentials.json", "utf8");
            const credentials = JSON.parse(raw);
            token = decrypt(credentials[userId]?.token);
            if (!token) return safelyRespond(interaction, []);
        } catch (e) {
            console.error("Erro ao obter token:", e);
            return safelyRespond(interaction, []);
        }

        const octokit = new Octokit({ auth: token });

        try {
            if (focusedName === "repo") {
                const response = await octokit.request("GET /orgs/{org}/repos", {
                    org: "thrireltda"
                });

                const repos = response.data
                    .filter(r => r.name.toLowerCase().includes(query))
                    .slice(0, 25)
                    .map(r => ({ name: r.name, value: r.name }));

                return safelyRespond(interaction, repos);
            }

            if (focusedName === "pr") {
                const repo = interaction.options.getString("repo");
                if (!repo) return safelyRespond(interaction, []);

                const response = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
                    owner: "thrireltda",
                    repo,
                    state: "open"
                });

                const prs = response.data
                    .filter(pr => pr.title.toLowerCase().includes(query))
                    .slice(0, 25)
                    .map(pr => ({
                        name: `#${pr.number} - ${pr.title.slice(0, 80)}`,
                        value: pr.number.toString()
                    }));

                return safelyRespond(interaction, prs);
            }

            return safelyRespond(interaction, []);
        } catch (e) {
            console.error("Erro no autocomplete:", e);
            return safelyRespond(interaction, []);
        }
    }
};

async function safelyRespond(interaction, choices) {
    try {
        if (!interaction.responded) {
            await interaction.respond(choices);
        }
    } catch (e) {
        // Silencia erros de autocomplete
    }
}