import {AudioPlayerStatus, createAudioResource, StreamType} from '@discordjs/voice';
import AudioType from "#enums/AudioType.js";

export default class
{
    static audioType;

    static getStatus(client)
    {
        return client.audioPlayer?.state.status || "NoPlayer";
    }
    static getQueueSize(client)
    {
        return client.audioPlayer?.musicQueue.length;
    }
    static getQueue(client)
    {
        return client.audioPlayer?.musicQueue;
    }
    static async addToQueue(interaction, client, result)
    {
        await client.audioPlayer?.musicQueue.push(result);
        if (this.getStatus(client) !== AudioPlayerStatus.Idle) return;
        client.emit("audioPlayerIdle", interaction);
    }
    static popFromQueue(client)
    {
        return client.audioPlayer?.musicQueue.shift();
    }
    static async play(client, source, audioType = AudioType.DEFAULT)
    {
        this.audioType = audioType
        const resource = createAudioResource(source, { inputType: StreamType.OggOpus, opusEncoded: true });
        await client.audioPlayer?.play(resource);
    }
    static async stop(client)
    {
        client.audioPlayer.musicQueue = [];
        this.audioType = AudioType.DEFAULT;
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
        client.emit("audioPlayerIdle", interaction);
    }
}