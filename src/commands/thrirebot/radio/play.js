import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import {AudioPlayerStatus, getVoiceConnection} from "@discordjs/voice";
import process from "process";
import safelyRespond from "../../../utils/safelyRespond.js";
import AudioType from "../../../enums/AudioType.js";
import discordJSVoice from "../../../facades/discordJSVoice.js";

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
    execute: async ({ client, interaction }) =>
    {
        let station = null;
        await interaction.deferReply();
        {
            const channel = interaction.member.voice.channel;
            if (!channel) return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
            if (discordJSVoice.getStatus(client) === AudioPlayerStatus.Playing && discordJSVoice.audioType === AudioType.MUSIC)
                await discordJSVoice.stop(client);
            const stationUuid = interaction.options.getString("frequencia");
            await fetch(`${process.env.RADIO_ENDPOINT}/stations/byuuid/${stationUuid}`)
            .then(response =>
            {
                switch (response.ok)
                {
                    case true:
                        return response.json();
                    case false:
                        throw new Error("Network response was not ok.");
                }
            })
            .then(data =>
            {
                if (data.length <= 0 || !data[0].url_resolved) return;
                station = data[0];
            })
            .catch(console.error)
            await discordJSVoice.play(client, station.url_resolved, AudioType.RADIO)
        }
        await interaction.editReply(`📻 Sintonizando **${station.name}** (${station.countrycode})...`);
    },
    autocomplete: async ({ interaction }) =>
    {
        const focused = interaction.options.getFocused(true);
        const query = focused.value.toLowerCase();
        switch (focused.name)
        {
            case "pais":
                await fetch(`${process.env.RADIO_ENDPOINT}/countries`)
                .then(response =>
                {
                    switch (response.ok)
                    {
                        case true:
                            return response.json();
                        case false:
                            throw new Error("Network response was not ok.");
                    }
                })
                .then(data =>
                {
                    const filtered = data
                    .filter(c => c.name.toLowerCase().includes(query))
                    .slice(0, 25)
                    .map(c =>
                    ({
                        name: `${c.name} (${c.iso_3166_1})`,
                        value: c.iso_3166_1
                    }));
                    return safelyRespond(interaction, filtered);
                    })
                .catch(console.error)
                break;
            case "frequencia":
                const countryCode = interaction.options.getString("pais");
                if (!countryCode) return safelyRespond(interaction, []);
                await fetch(`${process.env.RADIO_ENDPOINT}/stations/bycountrycodeexact/${encodeURIComponent(countryCode)}?hidebroken=true&order=votes&reverse=true`)
                .then(response =>
                {
                    switch (response.ok)
                    {
                        case true:
                            return response.json();
                        case false:
                            throw new Error("Network response was not ok.");
                    }
                })
                .then(data =>
                {
                    const vistos = new Set();
                    const lista = [];
                    for (const s of data)
                    {
                        const match = s.name.match(/(\d{2,3}(\.\d{1,2})?)/);
                        if (!match) continue;
                        const freq = match[0];
                        if (query && !freq.startsWith(query)) continue;
                        const chave = `${freq}-${s.name}`;
                        if (vistos.has(chave)) continue;
                        vistos.add(chave);
                        lista.push({name: `[${freq}] ${s.name}`, value: s.stationuuid});
                        if (lista.length >= 25) break;
                    }
                    return safelyRespond(interaction, lista);
                })
                .catch(console.error)
                break;
        }
        return safelyRespond(interaction, []);
    }
};