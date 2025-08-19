import { createAudioResource, StreamType } from '@discordjs/voice';

export default class DiscordJSVoiceLib
{
    static getStatus(client)
    {
        return client.audioPlayer?.state.status || "NoPlayer";
    }
    static async play(client, source)
    {
        const resource = await createAudioResource(source, { inputType: StreamType.Arbitrary });
        await client.audioPlayer?.play(resource);
    }
    static async stop(client)
    {
        client.audioPlayer.musicQueue = [];
        await client.audioPlayer?.stop();
        client.audioPlayer.isPlaying = false;
    }
    static async pause(client)
    {
        client.audioPlayer.pause();
    }
    static async unpause(client)
    {
        client.audioPlayer.unpause();
    }
}
