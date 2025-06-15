import { Client, Events } from 'discord.js';
import dotenv from 'dotenv';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import buildAllCommands from './commands/builder.js';

dotenv.config();

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildVoiceStates']
});

let commandList = [];

client.once('ready', async () => {
    console.log(`🤖 Logado como ${client.user.tag}`);

    // Carrega e registra os comandos dinamicamente
    commandList = await buildAllCommands();

    const slashData = commandList.map(cmd => cmd.data.toJSON());

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: slashData }
    );

    console.log(`✅ ${commandList.length} comandos registrados.`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

    const command = interaction.commandName;
    const group = interaction.options?.getSubcommandGroup(false);
    const sub = interaction.options?.getSubcommand(false);
    const baseName = [command, group, sub].filter(Boolean).join('.');

    const cmd = commandList.find(c =>
        c.data.name === command // comando base
    );

    if (!cmd) return console.warn(`❌ Comando base '${command}' não encontrado.`);

    try {
        if (interaction.isChatInputCommand() && cmd.execute)
            return cmd.execute({ interaction, client });

        if (interaction.isAutocomplete() && cmd.autocomplete)
            return cmd.autocomplete(interaction);
    } catch (error) {
        console.error(`❌ Erro ao executar comando '${baseName}':`, error);
        if (!interaction.replied && !interaction.deferred) {
            interaction.reply({
                content: "❌ Ocorreu um erro ao executar o comando.",
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);
