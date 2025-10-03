import {
    createAudioPlayer,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnectionStatus
} from "@discordjs/voice";

export default class
{
    static connection;

    static async join(interaction, client)
    {
        client.audioPlayer = await createAudioPlayer();
        client.audioPlayer.musicQueue = [];
        client.audioPlayer.isPlaying = false;
        client.audioPlayer.on('idle', () => client.emit('audioPlayerIdle', interaction, client));

        new Promise(async (resolve) =>
        {
            this.connection = await joinVoiceChannel
            ({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            await entersState(this.connection, VoiceConnectionStatus.Ready, 10_000);
            this.connection.subscribe(client.audioPlayer);
            resolve();
        })
        .catch(console.error);
    }
    static async leave(state)
    {
        await getVoiceConnection(state.guild.id)?.destroy();
    }
}