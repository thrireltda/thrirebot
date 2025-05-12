import { Client, Collection, Events } from 'discord.js';
import { Player, useMainPlayer } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { YoutubeiExtractor } from 'discord-player-youtubei';

const client = new Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildVoiceStates'] });
client.commands = new Collection();

client.player = new Player(client,
{
    ytdlOptions: {quality: "highestaudio", highWaterMark: 1 << 25},
    leaveOnEnd: true,
    leaveOnEndCooldown: 10000
});
async function setupPlayer()
{
    await useMainPlayer().extractors.loadMulti(DefaultExtractors);
    await useMainPlayer().extractors.register(YoutubeiExtractor, {});
}
setupPlayer();

export default client;