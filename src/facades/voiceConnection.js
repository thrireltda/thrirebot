import { createAudioPlayer, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";

export default class voiceConnection
{
    static connection;

    static async join(interaction, client)
    {
        client.audioPlayer = await createAudioPlayer();
        client.audioPlayer.musicQueue = [];
        client.audioPlayer.isPlaying = false;
        client.audioPlayer.on('idle', () => client.emit('audioPlayerIdle', interaction, client));

        new Promise((resolve) =>
        {
            this.connection = joinVoiceChannel
            ({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            client.emit('voiceConnectionAvailable', this.connection);
            resolve();
        })
    }
    static async leave(state)
    {
        await getVoiceConnection(state.guild.id)?.destroy();
    }
}