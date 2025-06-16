import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from "discord.js";
import { encrypt } from "../../../utils/crypto.js";
import { existsSync } from 'fs';

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("login")
        .setDescription("Faz login no GitHub")
        .addStringOption(option => option.setName("token").setDescription("Token pessoal").setRequired(true)),
    execute: async ({interaction}) =>
    {
        await interaction.deferReply({ ephemeral: true }); // <- GARANTE tempo para processar

        const token = interaction.options.getString("token");
        await fetch("https://api.github.com/user", {headers: { Authorization: `token ${token}` }})
        .then(res =>
        {
            if (!res.ok)
            {
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
            if (!existsSync(credentialsPath))
                await fs.writeFile(credentialsPath, JSON.stringify({}, null, 2));

            let file = {};
            try
            {
                const raw = await fs.readFile(credentialsPath, 'utf8');
                file = JSON.parse(raw);
            }
            catch (e)
            {
                /* arquivo ainda não existe */
            }

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
            if (!interaction.replied && !interaction.deferred)
                interaction.editReply({content: "❌ Ocorreu um erro ao tentar autenticar com o GitHub.", ephemeral: true});
        });

    }
};