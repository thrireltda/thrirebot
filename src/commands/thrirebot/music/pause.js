import { SlashCommandBuilder } from '@discordjs/builders';
import DiscordJSVoiceLib from "../../../facades/discordJSVoice.js";

export default
{
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses the current playing song."),
    execute: async ({client, interaction}) =>
    {
        await interaction.deferReply();
        {
            await DiscordJSVoiceLib.pause(client);
        }
        await interaction.deleteReply();
    }
};