import AudioType from "#enums/AudioType.js";
import { AudioPlayerStatus, createAudioResource, StreamType } from '@discordjs/voice';

export default class {
    static audioType;

    static getStatus = client => client.audioPlayer?.state?.status || "NoPlayer";
    static getQueue = client => client.audioPlayer?.musicQueue;
    static getQueueSize = client => this.getQueue(client).length;
    static popFromQueue = client => this.getQueue(client).shift();
    static async addToQueue(interaction, client, result) {
        await client.audioPlayer?.musicQueue.push(result);
        if (this.getStatus(client) !== AudioPlayerStatus.Idle) return;
        client.emit("audioPlayerIdle", interaction);
    }
    static async play(client, source, audioType = AudioType.DEFAULT) {
        this.audioType = audioType
        const resource = createAudioResource(source, { inputType: StreamType.OggOpus, opusEncoded: true });
        await client.audioPlayer?.play(resource);
    }
    static async stop(client) {
        client.audioPlayer.musicQueue = [];
        this.audioType = AudioType.DEFAULT;
        await client.audioPlayer?.stop(true);
    }
    static async pause(client) {
        client.audioPlayer?.pause();
    }
    static async unpause(client) {
        client.audioPlayer?.unpause();
    }
    static async skip(interaction, client) {
        this.audioType = AudioType.DEFAULT;
        await client.audioPlayer?.stop(true);
    }
}