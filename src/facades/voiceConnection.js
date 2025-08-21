import { createAudioPlayer, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import speakAndPlay from "../services/speakAndPlay.js";
import random from "../commands/thrirebot/radio/random.js";

export default class voiceConnection
{
    static connection;

    static async join(interaction, client)
    {
        const randomPhrase =
        [
            "Qual a boa de hoje?",
            "Qual a boa?",
            "O que manda?",
            "E aí, firmeza?",
            "Tudo certo?",
            "Como vai essa força?",
            "Beleza?",
            "Qual o plano?",
            "Tá de boas?",
            "E as novidades?",
            "Manda a real!",
            "O que conta de novo?",
            "Suave?",
            "Qual a missão de hoje?",
            "Bora pra cima?",
        ];

        client.audioPlayer = await createAudioPlayer();
        client.audioPlayer.musicQueue = [];
        client.audioPlayer.isPlaying = false;
        client.audioPlayer.on('idle', () => client.emit('audioPlayerIdle', interaction, client));

        new Promise((resolve) =>
        {
            this.connection = joinVoiceChannel
            ({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            client.emit('voiceConnectionAvailable', this.connection);
            resolve();
        })
        .then(async () =>
        {
            const now = new Date();
            const hours = now.getHours();
            const greetings = hours >= 5 && hours < 12 ? "Bom dia" : hours >= 12 && hours < 18 ? "Boa tarde" : "Boa noite";
            const displayName = interaction.user.globalName || interaction.user.username;
            const firstName = displayName.split(" ")[0]; // pega só a primeira palavra
            await speakAndPlay(client, `${greetings}, ${firstName}. ${randomPhrase[Math.floor(Math.random() * randomPhrase.length)]}`);
        })
        .catch(console.error);
    }
    static async leave(state)
    {
        await getVoiceConnection(state.guild.id)?.destroy();
    }
}