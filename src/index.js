import { Player, useMainPlayer  } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { Client, Events, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import buildAllCommands from './utils/builder.js';

dotenv.config();

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildVoiceStates']
});
client.player = new Player(client,
    {
        ytdlOptions: {quality: "highestaudio", highWaterMark: 1 << 25},
        leaveOnEnd: true,
        leaveOnEndCooldown: 10000
    });
await useMainPlayer().extractors.loadMulti(DefaultExtractors);
await useMainPlayer().extractors.register(YoutubeiExtractor, {});

let commandList = [];

client.once('ready', async () => {
    console.log(`🤖 Logado como ${client.user.tag}`);

    // 1. Carrega os comandos
    commandList = await buildAllCommands();

    // 2. Transforma em JSON para registrar no Discord
    const slashData = commandList.map(cmd => cmd.data.toJSON());

    // 3. Envia os comandos atualizados
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        // 🧹 Limpa comandos antigos
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );

        // 🧹 Limpa comandos antigos
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] }
        );

        console.log('🧼 Comandos antigos removidos.');

        // ✅ Registra comandos novos
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: slashData }
        );
        console.log(`✅ ${slashData.length} comandos registrados com sucesso.`);
    } catch (error) {
        console.error('❌ Falha ao registrar comandos:', error);
    }
});


client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

    const command = interaction.commandName;
    const group = interaction.options?.getSubcommandGroup(false);
    const sub = interaction.options?.getSubcommand(false);
    const baseName = [command, group, sub].filter(Boolean).join('.');

    const cmd = commandList.find(c => c.data.name === command);

    if (!cmd) {
        console.warn(`❌ Comando base '${command}' não encontrado.`);
        return;
    }

    try {
        if (interaction.isChatInputCommand() && cmd.execute)
            return cmd.execute({ interaction, client });

        if (interaction.isAutocomplete() && cmd.autocomplete)
            return cmd.autocomplete({ interaction, client });
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
