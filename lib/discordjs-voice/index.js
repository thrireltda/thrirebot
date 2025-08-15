import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    AudioPlayerStatus,
    entersState
} from '@discordjs/voice';
import delay from "../../src/utils/delay.js";

export default class DiscordJSVoiceLib
{
    static conn;

    static async play(client, source, channel = null)
    {
        if (!client.audioPlayer)
            client.audioPlayer = await createAudioPlayer();

        if (!this.conn)
        {
            this.conn = await joinVoiceChannel(
            {
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            await this.conn.subscribe(client.audioPlayer);
        }

        const resource = await createAudioResource(source, { inputType: StreamType.Arbitrary });
        await client.audioPlayer.play(resource);

/*        await entersState(this.player, AudioPlayerStatus.Playing, 10_000);
        // Se quiser aguardar até terminar:
        await entersState(this.player, AudioPlayerStatus.Idle, 10_000);*/

        await delay(10000);
    }

    static getStatus(client)
    {
        return client.audioPlayer?.state.status || "NoPlayer";
    }

    static async stop(client)
    {
        client.audioPlayer.musicQueue = [];
        await client.audioPlayer?.stop();
        client.audioPlayer.isPlaying = false;
    }
}
