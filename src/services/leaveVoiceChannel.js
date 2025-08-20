import { getVoiceConnection } from "@discordjs/voice";

export default async function(state)
{
    getVoiceConnection(state.guild.id)?.destroy();
}