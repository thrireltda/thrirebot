import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { spawn } from 'child_process';
import { EmbedBuilder } from 'discord.js';
import { createAudioPlayer, createAudioResource, NoSubscriberBehavior } from '@discordjs/voice';
import { fileURLToPath } from 'url';
import { voiceConnection } from '../../../events/voiceStateUpdate.js';
import ytSearch from 'yt-search';
import path from 'path';
import DiscordJSVoiceLib from "../../../../lib/discordjs-voice/index.js";
import espeakng_export from "../../../../lib/espeakng/index.js";
import os from "os";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ytdlpPath = path.join(__dirname, '../../../../bin/yt-dlp/win32-x64/yt-dlp.exe');

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Toca uma música")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Nome ou link da música")
                .setRequired(true)
        ),
    execute: async ({ interaction, client }) =>
    {
        await interaction.deferReply();
        if (!voiceConnection) return interaction.followUp({content: "O bot não está conectado a nenhum canal de voz.", ephemeral: true});

        // Garantir inicializações necessárias
        if (!client.musicQueue) client.musicQueue = [];
        if (!client.audioPlayer) {
            client.audioPlayer = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Play }
            });
            client.audioPlayer.on('idle', async () =>
            {
                if (client.musicQueue.length > 0)
                {
                    await playNext(client);
                }
                else
                {
                    await DiscordJSVoiceLib.stop(client)
                }
            });
        }
        if (!client.isPlaying) client.isPlaying = false;

        try {
            const query = interaction.options.getString("query");
            const searchResult = await ytSearch(query);
            if (!searchResult.videos.length) {
                return interaction.followUp({
                    content: 'Música não encontrada.',
                    ephemeral: true
                });
            }

            const selectedTrack = searchResult.videos[0];
            client.musicQueue.push(selectedTrack);

            const addedEmbed = new EmbedBuilder()
                .setTitle("🎵 Música adicionada à fila")
                .setDescription(`**[${selectedTrack.title}](${selectedTrack.url})**`)
                .setThumbnail(selectedTrack.thumbnail)
                .setFooter({ text: `Solicitada por ${interaction.user.username}` });

            await interaction.followUp({ embeds: [addedEmbed] });

            if (!client.isPlaying)
            {
                client.isPlaying = true;
                await playNext(client);
            }

        } catch (e) {
            console.error(e);
            throw new Error(`Falha ao tocar a música: ${e.message}`);
        }
    }
};

async function playNext(client)
{
    if (client.musicQueue.length === 0)
    {
        client.isPlaying = false;
        return;
    }

    const track = client.musicQueue.shift();
    const ytdlpProcess = await spawn(ytdlpPath, [
        '-f', 'bestaudio[ext=webm]/bestaudio',
        '-o', '-',
        '--quiet',
        '--no-warnings',
        track.url
    ], { stdio: ['ignore', 'pipe', 'inherit'] });

    const tempDir = path.resolve(os.tmpdir(), 'thrirebot');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    await DiscordJSVoiceLib.play(client, ytdlpProcess.stdout, null);
}