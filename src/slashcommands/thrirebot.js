import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from "discord.js";
import { promisify } from "util";
import {exec} from "child_process";
const execAsync = promisify(exec);

export default
{
    data: new SlashCommandBuilder().setName("thrirebot").setDescription("aa")
        .addSubcommandGroup(group =>
            group.setName("repo").setDescription("aa")
            .addSubcommand(subcommand =>
                subcommand.setName("cb").setDescription("aa")
                .addStringOption(option => option.setName("name").setDescription("aa").setRequired(true).setAutocomplete(true))
            )
        ),
    execute: async ({interaction}) =>
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
    }
};