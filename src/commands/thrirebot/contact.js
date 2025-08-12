import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import {
    joinVoiceChannel,
    createAudioResource,
    createAudioPlayer,
    StreamType,
    EndBehaviorType
} from "@discordjs/voice";
import safelyRespond from "../../utils/safelyRespond.js";

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName("contact")
        .setDescription("Conecta seu canal de voz com outro servidor (túnel de áudio otimizado)")
        .addStringOption(option =>
            option.setName("servidor")
                .setDescription("Servidor para conectar")
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("canal")
                .setDescription("Canal de voz no servidor selecionado")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    execute: async ({ client, interaction }) => {
        const guildTargetId = interaction.options.getString("servidor");
        const channelTargetId = interaction.options.getString("canal");

        const myChannel = interaction.member.voice.channel;
        if (!myChannel) {
            return interaction.reply({
                content: "Você precisa estar em um canal de voz para usar este comando.",
                ephemeral: true
            });
        }

        // Conectar no canal do servidor atual (A)
        const connA = joinVoiceChannel({
            channelId: myChannel.id,
            guildId: myChannel.guild.id,
            adapterCreator: myChannel.guild.voiceAdapterCreator
        });

        // Conectar no canal do servidor remoto (B)
        const guildTarget = client.guilds.cache.get(guildTargetId);
        if (!guildTarget) {
            return interaction.reply({ content: "Servidor não encontrado.", ephemeral: true });
        }

        const targetChannel = guildTarget.channels.cache.get(channelTargetId);
        if (!targetChannel || targetChannel.type !== 2) {
            return interaction.reply({ content: "Canal de voz inválido no servidor de destino.", ephemeral: true });
        }

        const connB = joinVoiceChannel({
            channelId: targetChannel.id,
            guildId: guildTarget.id,
            adapterCreator: guildTarget.voiceAdapterCreator
        });

        // Players para cada lado
        const playerA = createAudioPlayer();
        const playerB = createAudioPlayer();
        connA.subscribe(playerA);
        connB.subscribe(playerB);

        // Set anti-eco
        const antiEcho = new Set();

        const mirrorAudio = (sourceConn, targetPlayer) => {
            sourceConn.receiver.speaking.on("start", (userId) => {
                if (antiEcho.has(userId)) return;

                const opusStream = sourceConn.receiver.subscribe(userId, {
                    end: {
                        behavior: EndBehaviorType.AfterSilence,
                        duration: 750
                    }
                });

                const resource = createAudioResource(opusStream, { inputType: StreamType.Opus });

                antiEcho.add(userId);
                targetPlayer.play(resource);

                setTimeout(() => antiEcho.delete(userId), 2000);
            });
        };

        // Espelhar A → B e B → A
        mirrorAudio(connA, playerB);
        mirrorAudio(connB, playerA);

        await interaction.reply(
            `🔊 Túnel de áudio criado entre **${myChannel.name}** ↔ **${targetChannel.name}**.`
        );
    },

    autocomplete: async ({ client, interaction }) => {
        const focused = interaction.options.getFocused(true);
        const query = focused.value.toLowerCase();

        try {
            switch (focused.name) {
                case "servidor": {
                    const guilds = client.guilds.cache
                        .filter(g => g.id !== interaction.guild.id)
                        .map(g => ({ name: g.name, value: g.id }))
                        .filter(g => g.name.toLowerCase().includes(query))
                        .slice(0, 25);

                    return safelyRespond(interaction, guilds);
                }
                case "canal": {
                    const guildId = interaction.options.getString("servidor");
                    if (!guildId) return safelyRespond(interaction, []);

                    const guild = client.guilds.cache.get(guildId);
                    if (!guild) return safelyRespond(interaction, []);

                    const channels = guild.channels.cache
                        .filter(c => c.type === 2)
                        .map(c => ({ name: c.name, value: c.id }))
                        .filter(c => c.name.toLowerCase().includes(query))
                        .slice(0, 25);

                    return safelyRespond(interaction, channels);
                }
            }
        } catch (e) {
            throw new Error(`Erro no autocomplete: ${e}`);
        }
    }
};
