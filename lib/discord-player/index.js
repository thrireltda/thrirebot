// lib/player/index.js
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { DefaultExtractors } from "@discord-player/extractor";

export async function setupPlayer(client)
{
    const player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        },
        leaveOnEnd: true,
        leaveOnEndCooldown: 10000
    });
    await player.extractors.register(YoutubeiExtractor, {});
    await player.extractors.loadMulti(DefaultExtractors);
    client.player = player;
}
