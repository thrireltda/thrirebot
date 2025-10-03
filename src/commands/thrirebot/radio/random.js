import createsubcommand from "#utils/createsubcommand.js";
import vc from "#facades/vc.js";
import fetchendpoint from "#utils/fetchendpoint.js";
import djsv from "#facades/djsv.js";
import AudioType from "../../../core/enums/AudioType.js";

export default
{
    data: await createsubcommand("random", "Sintoniza uma estação de rádio aleatória", []),
    execute: async ({ client, interaction }) =>
    {
        await interaction.deferReply();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
        if (!vc.connection) await vc.join(interaction, client);
        let countries = null;
        let country = null;
        let stations = null;
        do
        {
            countries = await fetchendpoint(`${process.env.THRIRE_API}/v1/countries?countrycode=`)
            country = countries.countries[Math.floor(Math.random() * countries.countries.length)];
            stations = await fetchendpoint(`${process.env.THRIRE_API}/v1/stationsbycountrycodeexact?countrycode=${country.value}&frequency=`);
        }
        while (stations === null || stations.stations.length === 0)
        let station = stations.stations[Math.floor(Math.random() * stations.stations.length)];
        let url = await fetchendpoint(`${process.env.THRIRE_API}/v1/stationsbyuuid?stationuuid=${station.value}`)
        await djsv.play(client, url.url, AudioType.RADIO)
        await interaction.editReply(`📻 Sintonizando **${station.name}** (${country.value})...`);
    }
};