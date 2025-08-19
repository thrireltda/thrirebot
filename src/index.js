// src/index.js
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import process from 'process';

import getFFmpegPath from './utils/getFfmpegPath.js';
import getYtdlpPath from "./utils/getYtdlpPath.js";

dotenv.config();

// Adiciona a pasta do FFmpeg ao PATH do processo
process.env.PATH = `${path.dirname(getFFmpegPath())}${path.delimiter}${process.env.PATH}`;
process.env.PATH = `${path.dirname(getYtdlpPath())}${path.delimiter}${process.env.PATH}`;

// Cria a instância do bot
const client = new Client
({
    intents:
    [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Carrega eventos dinamicamente
const eventsPath = path.resolve('./src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles)
{
    const event = (await import(`./events/${file}`)).default;
    if (event.once)
        client.once(event.name, (...args) => event.execute(...args, client));
    else
        client.on(event.name, (...args) => event.execute(...args, client));
}

// Inicia o bot
client.login(process.env.TOKEN);
