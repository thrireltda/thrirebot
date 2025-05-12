const { Client, Collection, Events } = require('discord.js');
const { Player, useMainPlayer } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require('discord-player-youtubei');

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

module.exports = client;