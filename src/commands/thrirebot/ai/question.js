import os from 'os';
import fs from 'fs';
import path from 'path';
import GPT4js from 'gpt4js';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    StreamType
} from '@discordjs/voice';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import voiceTimeout from '../../../utils/voiceTimeout.js';
import gerarAudioEspeak from '../../../utils/gerarAudioEspeak.js'; // agora aceita idioma

const LANGUAGES = {
    'pt-br': 'português brasileiro',
    'en': 'inglês',
    'es': 'espanhol',
    'fr': 'francês',
    'de': 'alemão',
    'it': 'italiano',
    'ja': 'japonês',
    'ru': 'russo',
    'zh': 'chinês',
    'ar': 'árabe'
};

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('question')
        .setDescription('Faça uma pergunta para o GPT4.')
        .addStringOption(option =>
            option.setName('pergunta')
                .setDescription('A pergunta em si.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('lingua')
                .setDescription('Idioma da resposta')
                .setAutocomplete(true)
                .setRequired(false)
        ),

    execute: async ({ interaction }) => {
        await interaction.deferReply();

        const prompt = interaction.options.getString('pergunta');
        const langCode = interaction.options.getString('lingua') || 'pt-br';
        const langName = LANGUAGES[langCode] || 'português brasileiro';
        const userName = (interaction.user.globalName ?? interaction.user.username).split(' ')[0];
        const channel = interaction.member.voice.channel;

        const systemPrompt = `Você é um assistente que responde apenas em ${langName}.`;

        const provider = GPT4js.createProvider('Nextway');
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ];

        let resposta = '';
        try {
            resposta = await provider.chatCompletion(messages, {
                model: 'gpt-3.5-turbo',
                stream: false
            });

            resposta = `${userName}, ${resposta?.toLowerCase() ?? ''}`;
        } catch (e) {
            console.error(`Erro no comando /pergunta: ${e}`);
            await interaction.editReply('Erro ao gerar resposta da IA.');
            return;
        }

        if (!resposta) resposta = 'Não consegui gerar uma resposta.';

        // ÁUDIO EM QUALQUER IDIOMA
        if (channel) {
            const tempDir = path.resolve(os.tmpdir(), 'thrirebot');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const audioPath = path.join(tempDir, `resposta_${interaction.id}.mp3`);

            try {
                await gerarAudioEspeak(resposta, audioPath, langCode);
                const stats = fs.statSync(audioPath);
                if (stats.size < 1000) throw new Error('Áudio gerado é muito pequeno!');
            } catch (audioError) {
                console.error('[ÁUDIO] Falha ao gerar ou validar:', audioError);
                await interaction.editReply('Erro ao gerar áudio da resposta.');
                return;
            }

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(audioPath, { inputType: StreamType.Arbitrary });
            connection.subscribe(player);
            player.play(resource);

            player.on('error', err => console.error('[ÁUDIO] Erro no player:', err));
            player.on(AudioPlayerStatus.Idle, () => {
                try { fs.unlinkSync(audioPath); } catch {}
                voiceTimeout(channel.guild.id, connection);
            });
        }

        // ENVIO COMPLETO SEM TRUNCAMENTO
        const partes = resposta.match(/[\s\S]{1,4096}/g) || [resposta];
        const primeiroEmbed = new EmbedBuilder()
            .setTitle(`🤖 Resposta GPT4js (${langCode})`)
            .setDescription(partes[0]);

        await interaction.editReply({ embeds: [primeiroEmbed] });

        for (let i = 1; i < partes.length; i++) {
            await interaction.followUp({ content: partes[i] });
        }
    },

    autocomplete: async ({ interaction }) => {
        const focused = interaction.options.getFocused(true).value.toLowerCase();
        const filtered = Object.entries(LANGUAGES)
            .filter(([code, name]) => code.includes(focused) || name.includes(focused))
            .slice(0, 25)
            .map(([code, name]) => ({ name: `${name} (${code})`, value: code }));

        await interaction.respond(filtered);
    }
};
