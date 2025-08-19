import { createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";

export default async function(channel, guild, client)
{
    client.audioPlayer = await createAudioPlayer();
    client.musicQueue = [];
    client.isPlaying = false;
    new Promise((resolve) =>
    {
        const connection = joinVoiceChannel
        ({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
        resolve(connection);
    })
    .then(async (voiceConnection) =>
    {
        client.emit('voiceConnectionAvailable', voiceConnection);
    });
}