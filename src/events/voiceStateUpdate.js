import { Events } from 'discord.js';
import joinVoiceChannel from "../services/joinVoiceChannel.js";
import leaveVoiceChannel from "../services/leaveVoiceChannel.js";

export default
{
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client)
    {
        if (!oldState.channel && newState.channel && newState.channel.members.size === 1)
        {
            joinVoiceChannel(newState.channel, newState.guild, client)
        }
        if (oldState.channelId && !newState.channelId && oldState.channel.members.size === 0)
        {
            leaveVoiceChannel(oldState)
        }
    }
};
