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
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        switch (group)
        {
            case "auth":
                switch (subcommand)
                {
                    case "login":
                        const token = interaction.options.getString("token");
                        await interaction.deferReply({ ephemeral: true }); // <- GARANTE tempo para processar
                        await fetch("https://api.github.com/user", {
                            headers: { Authorization: `token ${token}` }
                        })
                            .then(res =>
                            {
                                if (!res.ok) {
                                    const failEmbed = new EmbedBuilder()
                                        .setTitle("❌ Falha na autenticação")
                                        .setDescription("Token inválido ou com permissões insuficientes.")
                                        .setColor(0xcc0000);
                                    interaction.editReply({ embeds: [failEmbed], ephemeral: true });
                                    throw new Error("Token inválido"); // ❗ Interrompe o restante dos .then()
                                }
                                return res.json();
                            })
                            .then(async data =>
                            {
                                if (!data) return;

                                const email = data.email || data.login;
                                const encryptedToken = encrypt(token);

                                const fs = await import('fs/promises');
                                const credentialsPath = './github_credentials.json';
                                if (!existsSync(credentialsPath)) {
                                    await fs.writeFile(credentialsPath, JSON.stringify({}, null, 2));
                                }

                                let file = {};
                                try {
                                    const raw = await fs.readFile(credentialsPath, 'utf8');
                                    file = JSON.parse(raw);
                                } catch (e) { /* arquivo ainda não existe*/ }

                                file[interaction.user.id] = { email, token: encryptedToken };
                                await fs.writeFile(credentialsPath, JSON.stringify(file, null, 2));

                                const successEmbed = new EmbedBuilder()
                                    .setTitle("✅Autenticação realizado com sucesso!")
                                    .setDescription(`GitHub autenticado para **${email}**.`)
                                    .setColor(0x2ecc71);
                                return interaction.editReply({ embeds: [successEmbed], ephemeral: true });
                            })
                            .catch(error =>
                            {
                                console.error("Erro na autenticação:", error);
                                if (!interaction.replied && !interaction.deferred) {
                                    interaction.editReply({
                                        content: "❌ Ocorreu um erro ao tentar autenticar com o GitHub.",
                                        ephemeral: true
                                    });
                                }
                            });
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
                            return interaction.reply({ content: "❌ Você ainda não fez login com o GitHub.", ephemeral: true });
                        }

                        let token;
                        try {
                            const raw = await readFile(credentialsPath, "utf8");
                            const credentials = JSON.parse(raw);
                            if (!credentials[userId]) {
                                return interaction.reply({ content: "❌ Token do GitHub não encontrado para este usuário.", ephemeral: true });
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