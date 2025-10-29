import { createAudioPlayer, joinVoiceChannel, entersState, VoiceConnectionStatus, getVoiceConnection } from "@discordjs/voice";

export default class {
    static getConnection(interaction) {
        return getVoiceConnection(interaction.guild.id);
    }
    static async join(interaction, client) {
        client.audioPlayer = await createAudioPlayer();
        client.audioPlayer.musicQueue = [];
        client.audioPlayer.isPlaying = false;
        client.audioPlayer.on('idle', () => client.emit('audioPlayerIdle', interaction, client));

        new Promise(async (resolve) => {
            await joinVoiceChannel
            ({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            await entersState(this.getConnection(interaction), VoiceConnectionStatus.Ready, 10_000);
            this.getConnection(interaction).subscribe(client.audioPlayer);
            resolve();
        })
        .catch(console.error);
    }
    static async leave(interaction) {
        await this.getConnection(interaction)?.destroy();
    }
}