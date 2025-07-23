// lib/player/index.js
import { Player, useMainPlayer } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { YoutubeiExtractor } from 'discord-player-youtubei';

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
    client.player = player;
    const mainPlayer = useMainPlayer();
    await mainPlayer.extractors.loadMulti(DefaultExtractors);
    await mainPlayer.extractors.register(YoutubeiExtractor, {});
}
