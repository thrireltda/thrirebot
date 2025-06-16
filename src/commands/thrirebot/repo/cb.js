import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from "discord.js";
import { promisify } from "util";
import {exec} from "child_process";
import {decrypt} from "../../../utils/crypto.js";
import {Octokit} from "@octokit/rest";
import fs from "fs/promises";
const execAsync = promisify(exec);

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("cb")
        .setDescription("Muda o branch atual do thrirebot")
        .addStringOption(option => option.setName("name").setDescription("Nome do branch").setRequired(true).setAutocomplete(true)),
    execute: async (interaction) =>
    {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        switch (group)
        {
            case "repo":

                switch (subcommand)
                {
                    case "cb":
                        const branch = interaction.options.getString("name");

                        const cwd = process.cwd(); // Diretório atual do bot
                        try
                        {
                            await execAsync(`git checkout ${branch}`, { cwd });
                            await execAsync(`git pull`, { cwd });
                            const successEmbed = new EmbedBuilder()
                            .setTitle("✅ Branch trocado com sucesso")
                            .setDescription(`Agora usando o branch \`${branch}\` no repositório \`thrirebot\`.`)
                            .setColor(0x2ecc71);
                            return interaction.reply({ embeds: [successEmbed], ephemeral: true });
                        }
                        catch (error)
                        {
                            const errorEmbed = new EmbedBuilder()
                            .setTitle("❌ Erro ao trocar o branch")
                            .setDescription(`Detalhes: \`${error.message}\``)
                            .setColor(0xcc0000);
                            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        }
                }
        }
    },
    autocomplete: async ({interaction}) =>
    {
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