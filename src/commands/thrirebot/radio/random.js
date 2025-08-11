import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";

const RADIO_API_BASE = "http://152.53.85.3/json";

async function fetchWithLog(url) {
    console.log(`[RADIO][API] GET: ${url}`);
    const res = await fetch(url);
    return res.json();
}

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName("random")
        .setDescription("Sintoniza uma rádio aleatória de um país aleatório"),

    execute: async ({ interaction }) => {
        await interaction.deferReply();

        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
        }

        try {
            // 🎯 Passo 1: pegar lista de países
            const countries = await fetchWithLog(`${RADIO_API_BASE}/countries`);
            if (!countries.length) {
                return interaction.editReply("❌ Não foi possível obter a lista de países.");
            }

            // 🎯 Passo 2: escolher país aleatório
            const country = countries[Math.floor(Math.random() * countries.length)];
            console.log(`[RADIO RANDOM] País selecionado: ${country.name} (${country.iso_3166_1})`);

            // 🎯 Passo 3: pegar lista de rádios do país
            const stations = await fetchWithLog(
                `${RADIO_API_BASE}/stations/bycountrycodeexact/${country.iso_3166_1}?hidebroken=true`
            );
            if (!stations.length) {
                return interaction.editReply(`❌ Nenhuma estação encontrada para o país ${country.name}.`);
            }

            // 🎯 Passo 4: escolher rádio aleatória
            const station = stations[Math.floor(Math.random() * stations.length)];
            console.log(`[RADIO RANDOM] Estação selecionada: ${station.name} - ${station.url_resolved}`);

            // 🎯 Passo 5: conectar e tocar
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(station.url_resolved, { inlineVolume: true });

            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Playing, () => {
                interaction.editReply(`🎲 Sintonizando **${station.name}** (${country.name})...`);
            });

            player.on("error", error => {
                console.error("[RADIO RANDOM] Erro no player:", error);
                interaction.followUp("❌ Ocorreu um erro ao tentar tocar a rádio aleatória.");
            });

        } catch (err) {
            console.error("[RADIO RANDOM] Erro geral:", err);
            await interaction.editReply("❌ Ocorreu um erro ao tentar buscar e tocar a rádio aleatória.");
        }
    }
};
