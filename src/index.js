// src/index.js
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import process from 'process';
import { Client, GatewayIntentBits } from 'discord.js';
import getFFmpegPath from './utils/getFFmpegPath.js';
import discordplayer_export  from '../lib/discord-player/index.js';

dotenv.config();

// Adiciona a pasta do FFmpeg ao PATH do processo
const ffmpegFolder = path.dirname(getFFmpegPath());
process.env.PATH = `${ffmpegFolder}${path.delimiter}${process.env.PATH}`;

// Cria a instância do bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Configura o player (discord-player + extractors)
await discordplayer_export(client);

// Carrega eventos dinamicamente
const eventsPath = path.resolve('./src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = (await import(`./events/${file}`)).default;

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Inicia o bot
client.login(process.env.TOKEN);
