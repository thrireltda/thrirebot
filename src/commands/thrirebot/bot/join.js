// src/commands/thrirebot/bot/bot.js
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import {joinVoiceChannel, getVoiceConnection, createAudioPlayer} from '@discordjs/voice';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('join')
        .setDescription('Faz o bot entrar no seu canal de voz'),
    async execute({ interaction, client })
    {
        const channel = interaction.member.voice.channel;
        client.audioPlayer = await createAudioPlayer();
        client.musicQueue = [];
        client.isPlaying = false;
        new Promise((resolve) =>
        {
            const connection = joinVoiceChannel
            ({
                channelId: channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            resolve(connection);
        })
            .then(async (voiceConnection) =>
            {
                client.emit('voiceConnectionAvailable', voiceConnection);
            });

        return interaction.reply({
            content: `✅ Entrei no canal de voz: **${channel.name}**`,
            ephemeral: true
        });
    }
};
