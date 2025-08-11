import { joinVoiceChannel,  createAudioPlayer,  createAudioResource, AudioPlayerStatus, StreamType} from '@discordjs/voice';

export default async function(channel, audioPath)
{
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
    });
    const player = createAudioPlayer();
    const resource = createAudioResource(audioPath, {inputType: StreamType.Arbitrary});
    connection.subscribe(player);
    await player.play(resource);
}