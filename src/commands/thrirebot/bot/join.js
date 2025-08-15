// src/commands/thrirebot/bot/bot.js
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { voiceConnection } from '../../../events/voiceStateUpdate.js';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('join')
        .setDescription('Faz o bot entrar no seu canal de voz'),

    async execute({ interaction, client }) {
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply({
                content: '❌ Você precisa estar em um canal de voz para me chamar.',
                ephemeral: true
            });
        }

        const existingConnection = getVoiceConnection(channel.guild.id);
        if (existingConnection) {
            return interaction.reply({
                content: '⚠️ Já estou conectado a um canal de voz.',
                ephemeral: true
            });
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false
        });

        client.emit('voiceConnectionAvailable', connection);

        return interaction.reply({
            content: `✅ Entrei no canal de voz: **${channel.name}**`,
            ephemeral: true
        });
    }
};
