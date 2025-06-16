import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { SlashCommandBuilder } from '@discordjs/builders';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsRoot = path.resolve(__dirname, '../commands');

export default async function buildAllCommands() {
    const allCommands = [];

    async function processPath(currentPath, relativeParts = []) {
        const items = await fs.readdir(currentPath, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(currentPath, item.name);
            const parts = [...relativeParts, item.name];

            if (item.isDirectory()) {
                await processPath(fullPath, parts);
            } else if (item.name.endsWith('.js')) {
                const fileName = item.name.replace('.js', '');
                const fileUrl = pathToFileURL(fullPath);
                const { default: module } = await import(fileUrl.href);

                if (!module?.data) {
                    console.warn(`⚠️ Módulo ${fileName} não possui 'data'`);
                    continue;
                }

                const [command, group, sub] = parts.map(p => p.replace('.js', ''));

                if (parts.length === 1) {
                    // Comando direto
                    allCommands.push({
                        data: module.data,
                        execute: module.execute,
                        autocomplete: module.autocomplete
                    });

                } else if (parts.length === 2) {
                    // Comando com grupo
                    let existing = allCommands.find(c => c.data.name === command);
                    if (!existing) {
                        existing = {
                            data: new SlashCommandBuilder().setName(command).setDescription(`Comando ${command}`),
                            groups: new Map(),
                            executeMap: new Map()
                        };
                        allCommands.push(existing);
                    }

                    existing.data.addSubcommand(subcmd =>
                        Object.assign(subcmd, module.data)
                    );
                    existing.executeMap.set(fileName, module);

                } else if (parts.length === 3) {
                    // Comando com grupo e subcomando
                    let existing = allCommands.find(c => c.data.name === command);
                    if (!existing) {
                        existing = {
                            data: new SlashCommandBuilder().setName(command).setDescription(`Comando ${command}`),
                            groups: new Map()
                        };
                        allCommands.push(existing);
                    }

                    if (!existing.groups.has(group)) {
                        existing.groups.set(group, new Map());
                        existing.data.addSubcommandGroup(g =>
                            g.setName(group)
                                .setDescription(`Grupo ${group}`)
                                .addSubcommand(subcmd =>
                                    Object.assign(subcmd, module.data)
                                )
                        );
                    } else {
                        const groupBuilder = existing.data.options.find(opt => opt.name === group);
                        groupBuilder?.addSubcommand(subcmd =>
                            Object.assign(subcmd, module.data)
                        );
                    }

                    existing.groups.get(group).set(fileName, module);
                }
            }
        }
    }

    await processPath(commandsRoot);

    // Adiciona os executores e autocompletes
    for (const cmd of allCommands) {
        const groupMap = cmd.groups || new Map();
        const executeMap = cmd.executeMap || new Map();

        cmd.execute = async ({ interaction, client }) => {
            const group = interaction.options.getSubcommandGroup(false);
            const sub = interaction.options.getSubcommand(false);
            let handler;

            if (group && groupMap.has(group)) {
                handler = groupMap.get(group)?.get(sub);
            } else if (executeMap.has(sub)) {
                handler = executeMap.get(sub);
            } else if (cmd.execute && typeof cmd.execute === 'function') {
                return cmd.execute({ interaction, client });
            }

            if (handler?.execute) return handler.execute({ interaction, client });

            return interaction.reply({
                content: '❌ Comando não encontrado.',
                ephemeral: true
            });
        };

        cmd.autocomplete = async (interaction) => {
            const group = interaction.options.getSubcommandGroup(false);
            const sub = interaction.options.getSubcommand(false);
            let handler;

            if (group && groupMap.has(group)) {
                handler = groupMap.get(group)?.get(sub);
            } else if (executeMap.has(sub)) {
                handler = executeMap.get(sub);
            }

            if (handler?.autocomplete)
                return handler.autocomplete(interaction);
        };
    }

    return allCommands;
}
