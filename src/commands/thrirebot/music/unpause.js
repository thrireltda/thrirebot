import { SlashCommandBuilder } from '@discordjs/builders';
import DiscordJSVoiceLib from "../../../../lib/discordjs-voice/index.js";

export default
{
    data: new SlashCommandBuilder()
        .setName("unpause")
        .setDescription("Retoma a música pausada."),
    execute: async ({client, interaction}) =>
    {
        await interaction.deferReply();
        {
            await DiscordJSVoiceLib.unpause(client);
        }
        await interaction.deleteReply();
    }
};