import fs from 'fs/promises';
import path from 'path';
import { SlashCommandBuilder } from '@discordjs/builders';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsRoot = path.resolve(__dirname);

export default async function buildAllCommands() {
    const folders = await fs.readdir(commandsRoot);
    const allCommands = [];

    for (const folder of folders) {
        const folderPath = path.join(commandsRoot, folder);
        const stat = await fs.stat(folderPath);
        if (!stat.isDirectory()) continue;

        const subfolders = await fs.readdir(folderPath);
        const subcommandGroups = new Map();
        const handlerMap = {};

        for (const groupName of subfolders) {
            const groupPath = path.join(folderPath, groupName);
            const groupStat = await fs.stat(groupPath);
            if (!groupStat.isDirectory()) continue;

            const subcommandFiles = await fs.readdir(groupPath);
            const subcommandGroupBuilder = {
                name: groupName,
                description: `Grupo: ${groupName}`,
                commands: []
            };

            for (const file of subcommandFiles) {
                if (!file.endsWith('.js')) continue;
                const subPath = pathToFileURL(path.join(groupPath, file));
                const { default: module } = await import(subPath);
                const subName = file.replace('.js', '');

                const built = module.data.setName(subName);
                subcommandGroupBuilder.commands.push(built);
                handlerMap[`${groupName}.${subName}`] = module;
            }

            if (subcommandGroupBuilder.commands.length > 0) {
                subcommandGroups.set(groupName, subcommandGroupBuilder.commands);
            }
        }

        // Criar o comando principal
        const command = new SlashCommandBuilder()
            .setName(folder)
            .setDescription(`Comando: ${folder}`);

        for (const [group, subs] of subcommandGroups.entries()) {
            command.addSubcommandGroup(g => {
                g.setName(group).setDescription(`Grupo: ${group}`);
                subs.forEach(sub => g.addSubcommand(() => sub));
                return g;
            });
        }

        allCommands.push({
            data: command,
            execute: async ({ interaction, client }) => {
                const group = interaction.options.getSubcommandGroup(false);
                const sub = interaction.options.getSubcommand(false);
                const key = `${group}.${sub}`;
                const handler = handlerMap[key];
                if (handler?.execute) return handler.execute({ interaction, client });
                return interaction.reply({ content: '❌ Comando não implementado.', ephemeral: true });
            },
            autocomplete: async (interaction) => {
                const group = interaction.options.getSubcommandGroup(false);
                const sub = interaction.options.getSubcommand(false);
                const key = `${group}.${sub}`;
                const handler = handlerMap[key];
                if (handler?.autocomplete) return handler.autocomplete(interaction);
            }
        });
    }

    return allCommands;
}