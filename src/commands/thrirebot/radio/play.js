import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import process from "process";
import safelyRespond from "../../../utils/safelyRespond.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Sintoniza uma estação de rádio pelo país e frequência")
        .addStringOption(option =>
            option.setName("pais")
                .setDescription("País onde a rádio transmite")
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("frequencia")
                .setDescription("Escolha a estação pela frequência e nome")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    execute: async ({ client, interaction }) => {
        await interaction.deferReply();

        const stationUuid = interaction.options.getString("frequencia");
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
        }

        // Parar música anterior
        const queue = client.player.queues.get(interaction.guild.id);
        if (queue) {
            queue.clear();
            queue.node.stop();
        }

        let station = null;
        try {
            const stations = (await fetch(`${process.env.RADIO_ENDPOINT}/stations/byuuid/${stationUuid}`)).json();

            if (stations.length > 0 && stations[0].url_resolved) {
                station = stations[0];
                console.log(`[RADIO] Estação encontrada: ${station.name} - ${station.url_resolved}`);
            }
        } catch (err) {
            console.error("[RADIO] Erro ao buscar estação:", err);
        }

        if (!station) {
            return interaction.editReply(`⚠️ Não foi possível sintonizar a estação selecionada.`);
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(station.url_resolved, { inlineVolume: true });

        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Playing, async () => {
            await interaction.editReply(`📻 Sintonizando **${station.name}** (${station.countrycode})...`);
        });

        player.on("error", error => {
            console.error("[RADIO] Erro no player:", error);
        });
    },
    autocomplete: async ({ interaction }) =>
    {
        const focused = interaction.options.getFocused(true);
        const query = focused.value.toLowerCase();

        try {
            if (focused.name === "pais") {
                const countries = (await fetch(`${process.env.RADIO_ENDPOINT}/countries`)).json();

                const filtered = countries
                    .filter(c => c.name.toLowerCase().includes(query))
                    .slice(0, 25)
                    .map(c => ({
                        name: `${c.name} (${c.iso_3166_1})`,
                        value: c.iso_3166_1
                    }));
                return safelyRespond(interaction, filtered);
            }

            if (focused.name === "frequencia") {
                const countryCode = interaction.options.getString("pais");
                if (!countryCode) return safelyRespond(interaction, []);

                const stations = (await fetch(`${process.env.RADIO_ENDPOINT}/stations/bycountrycodeexact/${encodeURIComponent(countryCode)}?hidebroken=true&order=votes&reverse=true`)).json();


                const vistos = new Set();
                const lista = [];

                for (const s of stations) {
                    const match = s.name.match(/(\d{2,3}(\.\d{1,2})?)/);
                    if (!match) continue;

                    const freq = match[0];
                    if (query && !freq.startsWith(query)) continue;

                    const chave = `${freq}-${s.name}`;
                    if (vistos.has(chave)) continue;
                    vistos.add(chave);

                    lista.push({
                        name: `[${freq}] ${s.name}`,
                        value: s.stationuuid
                    });

                    if (lista.length >= 25) break;
                }

                return safelyRespond(interaction, lista);
            }

            return safelyRespond(interaction, []);
        } catch (err) {
            console.error("[RADIO] Erro no autocomplete:", err);
            return safelyRespond(interaction, []);
        }
    }
};
