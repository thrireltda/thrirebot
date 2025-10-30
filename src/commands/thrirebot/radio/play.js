import createsubcommand from "#utils/createsubcommand.js";
import vc from "#facades/vc.js";
import fetchendpoint from "#utils/fetchendpoint.js";
import djsv from "#facades/djsv.js";
import AudioType from "#enums/AudioType.js";
import invokeFfmpeg from "#utils/invokeFfmpeg.js";
import invokeYtdlp from "#utils/invokeYtdlp.js";

export default {
    data: await createsubcommand("play", "Sintoniza uma estação de rádio", [
        { type: String, name: "pais", description: "País de onde a rádio transmite", autocomplete: true, required: true },
        { type: String, name: "frequencia", description: "Frequência da estação", autocomplete: true, required: true },
    ]),
    execute: async ({ client, interaction }) => {
        await interaction.deferReply();
        if (!vc.getConnection(interaction)) await vc.join(interaction, client);
        const data = await fetchendpoint(`${process.env.THRIRE_API}/stationsbyuuid?stationuuid=${interaction.options.getString("frequencia")}`)
        const ffmpeg = await invokeFfmpeg(client);
        const stdout = await invokeYtdlp(client, ffmpeg, data.response.url)
        await djsv.play(client, stdout, AudioType.RADIO)
        await interaction.editReply(`📻 Sintonizando **${data.response.name}**`);
    },
    autocomplete: async ({ interaction }) => {
        const name = interaction.options.getFocused(true).name.toLowerCase();
        const value = interaction.options.getFocused(true).value.toLowerCase();
        switch (name) {
            case "pais": {
                const data = await fetchendpoint(`${process.env.THRIRE_API}/countries?countrycode=${value}`)
                if (data === undefined) break;
                await interaction.respond(data.response.filter(c => c.name.toLowerCase().includes(value)).map(c => ({ name: c.name, value: c.value })).slice(0, 25));
                break;
            }
            case "frequencia": {
                const data = await fetchendpoint(`${process.env.THRIRE_API}/stationsbycountrycodeexact?countrycode=${interaction.options.getString("pais")}&frequency=${value}`,)
                if (data === undefined) break;
                await interaction.respond(data.response.filter(c => c.name.toLowerCase().includes(value)).map(c => ({name: c.name, value: c.value})).slice(0, 25));
                break;
            }
        }
    }
};