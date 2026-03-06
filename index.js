import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import process from 'process';
import getFFmpegPath from '#utils/getFFmpegPath.js';
import getYtdlpPath from "#utils/getYtdlpPath.js";

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates ] });
const eventsPath = path.resolve('./src/core/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));


global.appRoot = path.resolve(import.meta.dirname);

dotenv.config();
for (const file of eventFiles)
{
    const event = (await import(`#events/${file}`)).default;
    if (event.once) client.once(event.name, (...args) => event.execute(client, ...args));
    else client.on(event.name, (...args) => event.execute(client, ...args));
}
client.login(process.env.TOKEN);