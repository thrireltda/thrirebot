import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { SlashCommandBuilder } from '@discordjs/builders';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsRoot = path.resolve(__dirname, '../commands');

export default async function()
{
    const thrirebotCommand =
    {
        data: new SlashCommandBuilder()
            .setName('thrirebot')
            .setDescription('Comando thrirebot'),
        executeMap: new Map(),
        groups: new Map()
    };

    async function processPath(currentPath, relativeParts = [])
    {
        const items = await fs.readdir(currentPath, { withFileTypes: true });

        for (const item of items)
        {
            const fullPath = path.join(currentPath, item.name);
            const parts = [...relativeParts, item.name.replace('.js', '')];

            if (item.isDirectory())
            {
                await processPath(fullPath, parts);
                continue;
            }

            if (!item.name.endsWith('.js')) continue;

            const fileUrl = pathToFileURL(fullPath);
            const { default: module } = await import(fileUrl.href);

            if (!module?.data)
            {
                console.warn(`⚠️ Módulo ${item.name} não possui 'data'`);
                continue;
            }

            const [command, maybeGroup, maybeSub] = parts;

            if (command !== 'thrirebot') continue;

            // Subcomando direto: /thrirebot atualizar
            if (parts.length === 2)
            {
                thrirebotCommand.data.addSubcommand(sub => Object.assign(sub, module.data));
                thrirebotCommand.executeMap.set(maybeGroup, module);
            }

            // Subcomando em grupo: /thrirebot repo trocar-branch
            else if (parts.length === 3)
            {
                if (!thrirebotCommand.groups.has(maybeGroup))
                {
                    thrirebotCommand.groups.set(maybeGroup, new Map());
                    thrirebotCommand.data.addSubcommandGroup(group =>
                        group.setName(maybeGroup)
                            .setDescription(`Grupo ${maybeGroup}`)
                            .addSubcommand(sub => Object.assign(sub, module.data))
                    );
                }
                else
                {
                    const groupBuilder = thrirebotCommand.data.options.find(opt => opt.name === maybeGroup);
                    groupBuilder?.addSubcommand(sub => Object.assign(sub, module.data));
                }

                thrirebotCommand.groups.get(maybeGroup).set(maybeSub, module);
            }
        }
    }

    await processPath(commandsRoot);

    // Executor
    thrirebotCommand.execute = async ({ interaction, client }) =>
    {
        const group = interaction.options.getSubcommandGroup(false);
        const sub = interaction.options.getSubcommand(false);

        let handler;

        if (group && thrirebotCommand.groups.get(group)?.has(sub))
            handler = thrirebotCommand.groups.get(group).get(sub);
        else if (thrirebotCommand.executeMap.has(sub))
            handler = thrirebotCommand.executeMap.get(sub);

        if (handler?.execute)
            return handler.execute({ interaction, client });

        return interaction.reply({
            content: '❌ Comando não encontrado.',
            ephemeral: true
        });
    };

    // Autocomplete
    const hasAutocomplete =
        [...thrirebotCommand.groups.values()].some(g => [...g.values()].some(m => typeof m.autocomplete === 'function')) ||
        [...thrirebotCommand.executeMap.values()].some(m => typeof m.autocomplete === 'function');

    if (hasAutocomplete)
    {
        thrirebotCommand.autocomplete = async ({ interaction, client }) =>
        {
            const group = interaction.options.getSubcommandGroup(false);
            const sub = interaction.options.getSubcommand(false);

            let handler;

            if (group && thrirebotCommand.groups.get(group)?.has(sub))
                handler = thrirebotCommand.groups.get(group).get(sub);
            else if (thrirebotCommand.executeMap.has(sub))
                handler = thrirebotCommand.executeMap.get(sub);

            if (handler?.autocomplete)
                return handler.autocomplete({ interaction, client });
        };
    }

    return [thrirebotCommand];
}
