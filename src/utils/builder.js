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
                    allCommands.push({
                        data: module.data,
                        execute: module.execute,
                        autocomplete: module.autocomplete
                    });

                } else if (parts.length === 2) {
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

    for (const cmd of allCommands) {
        const groupMap = cmd.groups || new Map();
        const executeMap = cmd.executeMap || new Map();
        const originalExecute = cmd.execute;

        cmd.execute = async ({ interaction, client }) => {
            const group = interaction.options.getSubcommandGroup(false);
            const sub = interaction.options.getSubcommand(false);
            let handler;

            if (group && groupMap.has(group)) {
                handler = groupMap.get(group)?.get(sub);
            } else if (executeMap.has(sub)) {
                handler = executeMap.get(sub);
            } else if (typeof originalExecute === 'function') {
                return originalExecute({ interaction, client });
            }

            if (handler?.execute) {
                return handler.execute({ interaction, client });
            }

            return interaction.reply({
                content: '❌ Comando não encontrado.',
                ephemeral: true
            });
        };

        // ✅ Só define cmd.autocomplete se algum handler realmente tiver autocomplete
        const hasAutocomplete = (
            [...groupMap.values()].some(map => [...map.values()].some(m => typeof m.autocomplete === 'function')) ||
            [...executeMap.values()].some(m => typeof m.autocomplete === 'function') ||
            typeof cmd.autocomplete === 'function'
        );

        if (hasAutocomplete) {
            cmd.autocomplete = async ({ interaction, client }) => {
                const group = interaction.options.getSubcommandGroup(false);
                const sub = interaction.options.getSubcommand(false);
                let handler;

                if (group && groupMap.has(group)) {
                    handler = groupMap.get(group)?.get(sub);
                } else if (executeMap.has(sub)) {
                    handler = executeMap.get(sub);
                }

                if (handler?.autocomplete) {
                    return handler.autocomplete({ interaction, client });
                }
            };
        }
    }

    return allCommands;
}
