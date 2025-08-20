import { createAudioResource, StreamType } from '@discordjs/voice';
import AudioType from "../enums/AudioType.js";
import playNext from "../services/playNext.js";

export default class discordJSVoice
{
    static audioType;

    static getStatus(client)
    {
        return client.audioPlayer?.state.status || "NoPlayer";
    }
    static getQueueSize(client)
    {
        return client.audioPlayer.musicQueue.length;
    }
    static getQueue(client)
    {
        return client.audioPlayer.musicQueue;
    }
    static addToQueue(client, result)
    {
        client.audioPlayer.musicQueue.push(result);
    }
    static popFromQueue(client)
    {
        return client.audioPlayer.musicQueue.shift();
    }
    static async play(client, source, audioType = AudioType.DEFAULT)
    {
        this.audioType = audioType
        const resource = await createAudioResource(source, { inputType: StreamType.Arbitrary });
        await client.audioPlayer?.play(resource);
    }
    static async stop(client)
    {
        client.audioPlayer.musicQueue = [];
        await client.audioPlayer?.stop();
    }
    static async pause(client)
    {
        client.audioPlayer?.pause();
    }
    static async unpause(client)
    {
        client.audioPlayer?.unpause();
    }
    static async skip(interaction, client)
    {
        await playNext(interaction, client)
    }
}