import prism from "prism-media";
import {Worker} from "worker_threads";
import path from "path";
import espeakng_export from "../../lib/espeakng/index.js";
import os from "os";
import fs from "fs";
import DiscordJSVoiceLib from "../../lib/discordjs-voice/index.js";
import {AudioPlayerStatus} from "@discordjs/voice";
import ytSearch from "yt-search";

// ===== CONFIG =====
const ACTIVATION_PHRASE = 'ok bot';
const workerPath = path.resolve('./src/workers/voiceWorker.js');
const MIN_DELAY = 500; // mínimo 2 segundos entre comandos
const MAX_DELAY = 15000; // máximo 15 segundos após captura para executar
const lastCommandTimes = {};

// ===== Dicionário de comandos =====
const COMMAND_DICTIONARY =
{
    music:
    {
        play:
        {
            info:
            {
                keywords: ['play', 'toque', 'tocar', 'toca', 'reproduza', 'reproduzir', 'coloque', 'colocar', 'coloca'],
                params: [{name: 'query', type: 'string'}]
            },
            answer: (musica) => `Claro! Tocando agora ${musica} no youtube.`
        },
        pause:
        {
            info:
            {
                keywords: ['pause', 'pausar', 'pausa', 'segura'],
                params: []
            },
            answer: ""
        },
        stop:
        {
            info:
            {
                keywords: ['pare', 'parar', 'stop', 'cancela'],
                params: []
            },
            answer: ""
        },
        skip:
        {
            info:
            {
                keywords: ['pula', 'pular', 'skip', 'avança'],
                params: []
            },
            answer: ""
        }
    }
};

export default
{
    name: "voiceConnectionAvailable",
    async execute(connection, client)
    {
        const voiceWorker = new Worker(workerPath);
        voiceWorker.on('message', (msg) => {
            if (msg.type === 'ready') {
                console.log("🎙️ Worker de voz pronto!");
            } else if (msg.type === 'transcript') {
                handleTranscript(msg);
            } else if (msg.type === 'error') {
                console.error("❌ Erro no worker de voz:", msg.error);
            }
        });

        const receiver = connection.receiver;
        receiver.speaking.on('start', (userId) =>
        {
            const audioStream = receiver.subscribe(userId, { end: { silence: 1000 } });
            audioStream.setMaxListeners(0);

            const rawAudio = new prism.opus.Decoder({ rate: 16000, channels: 1, frameSize: 960 });
            const chunks = [];
            let silenceTimer;

            const stopCapture = () => {
                audioStream.destroy();
                if (chunks.length > 0) {
                    voiceWorker.postMessage({
                        type: 'audio',
                        buffer: Buffer.concat(chunks),
                        userId,
                        guildId: connection.joinConfig.guildId,
                        timestamp: Date.now()
                    });
                }
            };

            audioStream
                .pipe(rawAudio)
                .on('data', chunk => {
                    chunks.push(chunk);
                    clearTimeout(silenceTimer);
                    silenceTimer = setTimeout(stopCapture, 1000);
                })
                .on('end', stopCapture);
        });

        async function handleTranscript({ text, userId, guildId, timestamp })
        {
            const now = Date.now();

            // Controle de tempo mínimo entre comandos
            if (lastCommandTimes[userId] && now - lastCommandTimes[userId] < MIN_DELAY) {
                console.log(`⏳ Ignorando comando de ${userId}: intervalo menor que ${MIN_DELAY}ms`);
                return;
            }

            // Controle de tempo máximo
            if (now - timestamp > MAX_DELAY) {
                console.log(`⌛ Ignorando comando de ${userId}: capturado há mais de ${MAX_DELAY}ms`);
                return;
            }

            const normalized = text
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[.,!?]/g, "")
            .toLowerCase()
            .trim();

            if (!normalized.includes(ACTIVATION_PHRASE)) return;
            const commandPart = normalized.replace(ACTIVATION_PHRASE, '').trim();

            for (const [group, commands] of Object.entries(COMMAND_DICTIONARY))
            {
                for (const [subcommand, cmdData] of Object.entries(commands))
                {
                    if (cmdData.info.keywords.some(k => commandPart.includes(k)))
                    {
                        // Extrai parâmetros
                        const paramsValues = [];
                        const parts = commandPart.split(" ").filter(p => !cmdData.info.keywords.includes(p));

                        cmdData.info.params.forEach((param, index) =>
                        {
                            if (index === cmdData.info.params.length - 1)
                            {
                                let value = parts.slice(index).join(" ").trim();
                                value = value.replace(/^(e\s+)/i, "").trim();
                                paramsValues.push(value);
                            }
                            else
                            {
                                paramsValues.push(parts[index] || "");
                            }
                        });

                        const guild = client.guilds.cache.get(guildId);
                        const member = guild?.members.cache.get(userId);
                        if (!member) return;

                        console.log(`🎤 [VOICE CMD] ${member.user.tag} executou: /thrirebot ${group} ${subcommand} | Params: ${JSON.stringify(paramsValues)} | Servidor: ${guild?.name}`);

                        const rootCmd = client.commands.find(c => c.data.name === 'thrirebot');
                        if (!rootCmd) return;

                        const fakeInteraction =
                        {
                            client: client,
                            guild: guild.id,
                            member,
                            id: Math.random() * (9999999 - 1000000) + 1000000,
                            channel: member.voice.channel,
                            user: member.user,
                            options:
                            {
                                getSubcommandGroup: () => group,
                                getSubcommand: () => subcommand,
                                getString: (name) =>
                                {
                                    const index = cmdData.info.params.findIndex(p => p.name === name);
                                    return index >= 0 ? paramsValues[index] : "";
                                }
                            },
                            reply: () => {},
                            followUp: () => {},
                            deferReply: async () => {},
                            editReply: async () => {},
                            deleteReply: async () => {}
                        };

                        if (DiscordJSVoiceLib.getStatus(fakeInteraction.client) !== AudioPlayerStatus.Playing && cmdData.answer !== "")
                        {
                            const tempDir = path.resolve(os.tmpdir(), 'thrirebot');
                            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                            const audioPath = path.join(tempDir, `resposta_${fakeInteraction.id}.mp3`);
                            const searchResult = await ytSearch(fakeInteraction.options.getString('query'));
                            await espeakng_export(cmdData.answer(searchResult.videos[0].title), audioPath);
                            await DiscordJSVoiceLib.play(fakeInteraction.client, audioPath, fakeInteraction.channel)
                        }
                        await rootCmd.execute({ interaction: fakeInteraction, client });
                        lastCommandTimes[userId] = now;
                        return;
                    }
                }
            }
        }
    }
}