import createcommand from "#utils/createcommand.js";
import getjsfiles from "#utils/getjsfiles.js";
import { pathToFileURL } from "url";
import path, { join } from "path";
import { REST, Routes } from "discord.js";

export default class {
    static async buildCommandTree(client) {
        const data = await createcommand("thrirebot", "Executa ações relacionadas ao thrirebot.");
        const subcommands = new Map(), groups = new Map();
        const files = await getjsfiles(import.meta.url, "../../commands/thrirebot", 2);
        for (const file of files)
            switch (pathToFileURL(join(import.meta.url, "../../commands/thrirebot")) === file.rootPath) {
                case true:
                    data.addSubcommand(sub => Object.assign(sub, file.content.data));
                    subcommands.set(file.content.data.name, file);
                    break;
                case false:
                    const group = path.basename(file.rootPath);
                    switch (groups.has(group)) {
                        case true:
                            const groupBuilder = data.options.find(opt => opt.name === group);
                            groupBuilder?.addSubcommand(sub => Object.assign(sub, file.content.data));
                            break;
                        case false:
                            groups.set(group, new Map());
                            data.addSubcommandGroup(g =>
                                g.setName(group)
                                    .setDescription(`Grupo ${group}`)
                                    .addSubcommand(sub => Object.assign(sub, file.content.data))
                            );
                            break;
                    }
                    groups.get(group).set(file.content.data.name, file);
                    break;
            }
        const execute = async ({ interaction, client }) => {
            const group = interaction.options.getSubcommandGroup(false);
            const subcommand = interaction.options.getSubcommand(false);
            let handler = group && groups.get(group)?.has(subcommand) ? groups.get(group).get(subcommand) : subcommands.get(subcommand);
            if (handler === null || handler === undefined) return interaction.reply({ content: '❌ Comando não encontrado.', ephemeral: true });
            return handler.content.execute({ interaction, client });
        };
        const autocomplete = async ({ interaction, client }) => {
            const group = interaction.options.getSubcommandGroup(false);
            const subcommand = interaction.options.getSubcommand(false);
            let handler = group && groups.get(group)?.has(subcommand) ? groups.get(group).get(subcommand) : subcommands.get(subcommand);
            if (handler === null || handler === undefined) return;
            return handler.content.autocomplete({ interaction, client });
        };
        client.commands = [{ data: data, subcommands: subcommands, groups: groups, execute: execute, autocomplete: autocomplete }];
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: client.commands.map(cmd => cmd.data.toJSON()) });
    }
}