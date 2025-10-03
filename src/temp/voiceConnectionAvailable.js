import { Worker } from "worker_threads";
import { AudioPlayerStatus, entersState } from "@discordjs/voice";
import prism from "prism-media";
import path from "path";
import speakAndPlay from "src/temp/speakAndPlay.js";
import discordJSVoiceLib from "#facades/djsv.js";
const workerPath = path.resolve('./src/core/workers/voiceWorker.js');

export default
{
    name: "voiceConnectionAvailable",
    async execute(connection, client)
    {
        await connection.subscribe(client.audioPlayer);
        const voiceWorker = new Worker(workerPath);
        voiceWorker.on('message', (msg) =>
        {
            switch (msg.type)
            {
                case 'ready':
                    console.log("🎙️ Worker de voz pronto!");
                    break;
                case 'error':
                    console.error("❌ Erro no worker de voz:", msg.error);
                    break;
                case 'transcript':
                    handleTranscript(msg);
                    break;
            }
        });
        const receiver = connection.receiver;
        receiver.speaking.on('start', (userId) =>
        {
            const audioStream = receiver.subscribe(userId,
            {
                end:
                {
                    silence: 1000
                }
            });
            audioStream.setMaxListeners(0);
            const rawAudio = new prism.opus.Decoder({ rate: 16000, channels: 1, frameSize: 960 });
            const chunks = [];
            let silenceTimer;
            const stopCapture = () =>
            {
                audioStream.destroy();
                if (chunks.length > 0)
                {
                    voiceWorker.postMessage
                    ({
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
            .on('data', chunk =>
            {
                chunks.push(chunk);
                clearTimeout(silenceTimer);
                silenceTimer = setTimeout(stopCapture, 1000);
            })
            .on('end', stopCapture);
        });
        async function handleTranscript({ text, userId, guildId, timestamp })
        {
            //todo: tempo maximo de silencio e tempo maximo falado

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
                    const { info, answer } = cmdData;
                    if (info.keywords.some(k => info.keywords.includes(k)))
                    {
                        const paramsValues = [];
                        const parts = commandPart.split(" ").filter(p => !info.keywords.includes(p));
                        info.params.forEach((param, index) =>
                        {
                            let value = parts[index] || "";
                            if (index === info.params.length - 1)
                            {
                                let value = parts.slice(index).join(" ").trim();
                                value = value.replace(/^(e\s+)/i, "").trim();
                                paramsValues.push(value);
                            }
                            paramsValues.push(value);
                        });
                        const guild = client.guilds.cache.get(guildId);
                        const member = guild?.members.cache.get(userId);
                        console.log(`🎤 [VOICE CMD] ${member.user.tag} executou: /thrirebot ${group} ${subcommand} | Params: ${JSON.stringify(paramsValues)} | Servidor: ${guild?.name}`);
                        const fakeInteraction =
                        {
                            client: client,
                            guild: guild.id,
                            member: member,
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
                        if (discordJSVoiceLib.getStatus(fakeInteraction.client) !== AudioPlayerStatus.Playing && answer !== "")
                        {
                            await speakAndPlay(fakeInteraction.client, fakeInteraction.options.getString('query'));
                            await entersState(client.audioPlayer, AudioPlayerStatus.Playing, 10_000);
                            await entersState(client.audioPlayer, AudioPlayerStatus.Idle, 10_000);
                        }
                        const rootCmd = client.commands.find(c => c.data.name === 'thrirebot');
                        await rootCmd.execute({ interaction: fakeInteraction, client });
                        return;
                    }
                }
            }
        }
    }
}