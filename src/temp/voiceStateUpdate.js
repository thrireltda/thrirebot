import { Events } from 'discord.js';
import voiceConnection from "#facades/vc.js";

export default
{
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client)
    {
        if (!oldState.channel && newState.channel && newState.channel.members.size === 1)
        {
            await voiceConnection.join(newState, client)
        }
        if (oldState.channelId && !newState.channelId && oldState.channel.members.size === 0)
        {
            await voiceConnection.leave(oldState)
        }
    }
};
