// src/events/voiceStateUpdate.js
import { Events } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';

export let voiceConnection = null;

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const guild = newState.guild;
        const isBot = (state) => state?.member?.user?.bot;

        // 1️⃣ Humano entrou na call
        if (!oldState.channelId && newState.channelId && !isBot(newState)) {
            const channel = newState.channel;
            const alreadyConnected = channel.members.has(client.user.id);

            if (!alreadyConnected) {
                try {
                    console.log(`🎧 Usuário entrou: ${newState.member.user.username} — conectando bot...`);

                    voiceConnection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: guild.id,
                        adapterCreator: guild.voiceAdapterCreator,
                        selfDeaf: false, // Não entrar surdo
                        selfMute: false  // Não entrar mutado
                    });

                    if (voiceConnection) {
                        client.emit('voiceConnectionAvailable', voiceConnection);
                        console.log(`🔊 Bot entrou no canal: ${channel.name}`);
                    }
                } catch (err) {
                    console.error(`❌ Erro ao conectar no canal ${channel.name}:`, err);
                }
            }
        }

        // 2️⃣ Todos os humanos saíram
        if (oldState.channelId && !newState.channelId && !isBot(oldState)) {
            const channel = oldState.channel;
            const nonBotMembers = channel.members.filter(m => !m.user.bot);

            if (nonBotMembers.size === 0) {
                const connection = getVoiceConnection(guild.id);
                if (connection) {
                    connection.destroy();
                    voiceConnection = null;
                    console.log(`🚪 Canal vazio, desconectando: ${channel.name}`);
                }
            }
        }
    }
};
