import { Events } from 'discord.js';
import joinVoiceChannel from "../services/joinVoiceChannel.js";
import leaveVoiceChannel from "../services/leaveVoiceChannel.js";

export default
{
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client)
    {
        const isBot = (state) => state?.member?.user?.bot;
        if (!oldState.channel && newState.channel && !isBot(newState))
        {
            joinVoiceChannel(newState.channel, newState.guild, client)
        }
        if (oldState.channelId && !newState.channelId && !isBot(oldState))
        {
            leaveVoiceChannel(oldState)
        }
    }
};
