import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import process from "process";
import safelyRespond from "../../../utils/safelyRespond.js";
import discordjsvoice_export from "../../../../lib/discordjs-voice/index.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("random")
        .setDescription("Sintoniza uma rádio aleatória de um país aleatório"),
    execute: async ({ interaction }) =>
    {
        let station = null;
        await interaction.deferReply();
        {
            const channel = interaction.member.voice.channel;
            if (!channel) return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
            try
            {
                let country = null;
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
                        country = data[Math.floor(Math.random() * data.length)];
                    })

                await fetch(`${process.env.RADIO_ENDPOINT}/stations/bycountrycodeexact/${country.iso_3166_1}?hidebroken=true`)
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
                    station = data[Math.floor(Math.random() * data.length)];
                })

                await discordjsvoice_export(channel, station.url_resolved)
            }
            catch (err)
            {
                console.error("[RADIO RANDOM] Erro geral:", err);
                await interaction.editReply("❌ Ocorreu um erro ao tentar buscar e tocar a rádio aleatória.");
            }
        }
        await interaction.editReply(`📻 Sintonizando **${station.name}** (${station.countrycode})...`);
    }
};