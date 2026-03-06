import AudioType from "#enums/AudioType.js";
import { AudioPlayerStatus, createAudioResource, StreamType } from '@discordjs/voice';

export default class {
    static audioType;

    static getStatus = client => client.audioPlayer?.state?.status || "NoPlayer";
    static getQueue = client => client.audioPlayer?.musicQueue;
    static getQueueSize = client => this.getQueue(client).length;
    static popFromQueue = client => this.getQueue(client).shift();
    static async addToQueue(result, client, interaction) {
        await client.audioPlayer?.musicQueue.push(result);
        client.emit("playerQueueIncreased", interaction);
    }
    static async play(client, source, audioType = AudioType.DEFAULT) {
        this.audioType = audioType
        await client.audioPlayer?.play(createAudioResource(source, { inputType: StreamType.OggOpus, opusEncoded: true }));
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
    static async skip(client) {
        this.audioType = AudioType.DEFAULT;
        await client.audioPlayer?.stop(true);
    }
}