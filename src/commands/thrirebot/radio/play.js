import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { AudioPlayerStatus } from "@discordjs/voice";
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
            await fetch(`${process.env.THRIRE_API}/stationsbyuuid?stationuuid=${stationUuid}`)
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
                station = data;
            })
            .catch(console.error)
            await discordJSVoice.play(client, station.url, AudioType.RADIO)
        }
        await interaction.editReply(`📻 Sintonizando **${station.name}**`);
    },
    autocomplete: async ({ interaction }) =>
    {
        const focused = interaction.options.getFocused(true);
        const query = focused.value.toLowerCase();
        switch (focused.name)
        {
            case "pais":
                await fetch(`${process.env.THRIRE_API}/countries?countrycode=${query}`)
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
                    const filtered = data.countries
                    .filter(c => c.name.toLowerCase().includes(query))
                    .slice(0, 25)
                    .map(c =>
                    ({
                        name: c.name.replace(/[()]/g, "").replace(c.value, ""),
                        value: c.value
                    }));
                    return safelyRespond(interaction, filtered);
                    })
                .catch(console.error)
                break;
            case "frequencia":
                const countryCode = interaction.options.getString("pais");
                if (!countryCode) return safelyRespond(interaction, []);
                await fetch(`${process.env.THRIRE_API}/stationsbycountrycodeexact?countrycode=${countryCode}&frequency=${query}`)
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
                    const filtered = data.stations
                    .filter(c => c.name.toLowerCase().includes(query))
                    .slice(0, 25)
                    .map(c =>
                    ({
                        name: c.name,
                        value: c.value
                    }));
                    return safelyRespond(interaction, filtered);
                })
                .catch(console.error)
                break;
        }
        return safelyRespond(interaction, []);
    }
};