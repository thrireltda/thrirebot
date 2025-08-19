import { SlashCommandBuilder } from '@discordjs/builders';
import DiscordJSVoiceLib from "../../../../lib/discordjs-voice/index.js";

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