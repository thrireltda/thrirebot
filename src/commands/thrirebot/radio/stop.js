import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import DiscordJSVoiceLib from "../../../../lib/discordjs-voice/index.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("stop")
        .setDescription("Para a rádio e desconecta do canal de voz."),
    execute: async ({ client, interaction }) =>
    {
        await interaction.deferReply({ ephemeral: true })
        {
            await DiscordJSVoiceLib.stop(client);
        }
        await interaction.deleteReply();
    }
};