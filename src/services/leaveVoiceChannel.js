import { getVoiceConnection } from "@discordjs/voice";

export default async function(state)
{
    const nonBotMembers = state.channel.members.filter(m => !m.user.bot);
    if (nonBotMembers.size !== 0) return;
    getVoiceConnection(state.guild.id)?.destroy();
}