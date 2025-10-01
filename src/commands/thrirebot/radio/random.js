import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import process from "process";
import DiscordJSVoiceLib from "../../../core/facades/discordJSVoice.js";
import AudioType from "../../../core/enums/AudioType.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("random")
        .setDescription("Sintoniza uma rádio aleatória de um país aleatório"),
    execute: async ({ client, interaction }) =>
    {
        let station = null;
        await interaction.deferReply();
        {
            const channel = interaction.member.voice.channel;
            if (!channel) return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
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
            .catch(console.error);
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
            .catch(console.error);
            await DiscordJSVoiceLib.play(client, station.url_resolved, AudioType.RADIO)
        }
        await interaction.editReply(`📻 Sintonizando **${station.name}** (${station.countrycode})...`);
    }
};