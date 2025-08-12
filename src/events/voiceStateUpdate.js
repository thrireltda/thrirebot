import { Events } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const guild = newState.guild;

        // Ignorar se foi o próprio bot
        if ((newState.member && newState.member.user.bot) || (oldState.member && oldState.member.user.bot)) {
            return;
        }

        // Pessoa entrou em um canal de voz
        if (!oldState.channelId && newState.channelId) {
            const channel = newState.channel;

            // Se o bot ainda não está nesse canal
            const botInChannel = channel.members.has(client.user.id);
            if (!botInChannel) {
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator
                });
            }
        }

        // Pessoa saiu de um canal de voz
        if (oldState.channelId && !newState.channelId) {
            const channel = oldState.channel;
            const nonBotMembers = channel.members.filter(m => !m.user.bot);

            // Se não restou nenhum humano no canal, bot sai
            if (nonBotMembers.size === 0) {
                const connection = getVoiceConnection(guild.id);
                if (connection) {
                    connection.destroy();
                }
            }
        }
    }
};
