import createsubcommand from "#utils/createsubcommand.js";
import vc from "#facades/vc.js";
import fetchendpoint from "#utils/fetchendpoint.js";
import djsv from "#facades/djsv.js";
import AudioType from "../../../core/enums/AudioType.js";

export default {
    data: await createsubcommand("random", "Sintoniza uma estação de rádio aleatória", []),
    execute: async ({ client, interaction }) => {
        await interaction.deferReply();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
        if (!vc.getConnection(interaction)) await vc.join(interaction, client);
        let countries = null;
        let country = null;
        let stations = null;
        do {
            countries = await fetchendpoint(`${process.env.THRIRE_API}/countries?countrycode=`)
            // todo: check code
            country = countries.response[Math.floor(Math.random() * countries.response.length)];
            console.log(country);
            stations = await fetchendpoint(`${process.env.THRIRE_API}/stationsbycountrycodeexact?countrycode=${country.value}&frequency=`);
        }
        // todo: check code
        while (stations === null || stations.response.length === 0)
        let station = stations.response[Math.floor(Math.random() * stations.response.length)];
        let url = await fetchendpoint(`${process.env.THRIRE_API}/stationsbyuuid?stationuuid=${station.value}`)
        await djsv.play(client, url.response.url, AudioType.RADIO)
        await interaction.editReply(`📻 Sintonizando **${station.name}** (${country.value})...`);
    }
};