import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from "discord.js";
import { encrypt } from "../utils/crypto.js";
import { existsSync } from 'fs';
import { decrypt } from "../utils/crypto.js";
import {readFile} from "fs/promises";
import {Octokit} from "octokit";

export default
{
    data: new SlashCommandBuilder().setName("gh").setDescription("aa")
        .addSubcommandGroup(group =>
            group.setName("auth").setDescription("aa")
            .addSubcommand(subcommand =>
                subcommand.setName("login").setDescription("aa")
                .addStringOption(option => option.setName("token").setDescription("aa").setRequired(true))
            )
        )
        .addSubcommandGroup(group =>
            group.setName("pr").setDescription("aa")
            .addSubcommand(subcommand =>
                subcommand.setName("approve").setDescription("aa")
                .addStringOption(option => option.setName("repo").setDescription("Repositório da organização").setRequired(true).setAutocomplete(true))
                .addStringOption(option => option.setName("pr").setDescription("Número da pull request").setRequired(true).setAutocomplete(true))
            )
        ),
    execute: async ({interaction}) =>
    {
        await interaction.deferReply({ ephemeral: true }); // <- GARANTE tempo para processar

        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        switch (group)
        {
            case "auth":
                switch (subcommand)
                {
                    case "login":

                }
                break;
            case "pr":
                switch (subcommand)
                {
                    case "approve":
                        const userId = interaction.user.id;
                        const repo = interaction.options.getString("repo");
                        const prNumber = parseInt(interaction.options.getString("pr"));

                        const credentialsPath = "./github_credentials.json";
                        if (!existsSync(credentialsPath)) {
                            return interaction.editReply({ content: "❌ Você ainda não fez login com o GitHub.", ephemeral: true });
                        }

                        let token;
                        try {
                            const raw = await readFile(credentialsPath, "utf8");
                            const credentials = JSON.parse(raw);
                            if (!credentials[userId]) {
                                return interaction.editReply({ content: "❌ Token do GitHub não encontrado para este usuário.", ephemeral: true });
                            }
                            token = decrypt(credentials[userId].token);
                        } catch (error) {
                            console.error("Erro ao ler token:", error);
                            return interaction.reply({ content: "❌ Erro ao acessar seu token do GitHub.", ephemeral: true });
                        }

                        const octokit = new Octokit({ auth: token });

                        try {
                            // ✅ Aprovar PR
                            await octokit.pulls.createReview({
                                owner: "thrireinc",
                                repo,
                                pull_number: prNumber,
                                event: "APPROVE"
                            });

                            const embed = new EmbedBuilder()
                                .setTitle("✅ Pull Request aprovada")
                                .setDescription(`PR \`#${prNumber}\` do repositório \`${repo}\` foi aprovada.`)
                                .setColor(0x2ecc71);

                            return interaction.reply({ embeds: [embed], ephemeral: true });

                        } catch (error) {
                            console.error("Erro ao aprovar PR:", error);
                            return interaction.reply({
                                content: "❌ Não foi possível aprovar a PR. Verifique se o número está correto ou se você tem permissão.",
                                ephemeral: true
                            });
                        }
                }
        }
    }
};