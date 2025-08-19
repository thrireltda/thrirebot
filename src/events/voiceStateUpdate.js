import { Events } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection, createAudioPlayer } from '@discordjs/voice';

export default
{
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client)
    {
        const guild = newState.guild;
        const isBot = (state) => state?.member?.user?.bot;

        if (!oldState.channel && newState.channel && !isBot(newState))
        {
            const channel = newState.channel;
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
        if (oldState.channelId && !newState.channelId && !isBot(oldState))
        {
            const channel = oldState.channel;
            const nonBotMembers = channel.members.filter(m => !m.user.bot);
            if (nonBotMembers.size !== 0) return;
            getVoiceConnection(guild.id)?.destroy();
        }
    }
};
