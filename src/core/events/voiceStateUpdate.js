import { Events } from 'discord.js';
import vc from "#facades/vc.js";

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const afk = client.channels.cache.get("1194414149338402837");
        if (oldState.channelId && !newState.channelId) {
            if (oldState.channel.members.size <= 1 && afk.members.size <= 0) {
                await vc.leave(oldState)
            }
        }
    }
}