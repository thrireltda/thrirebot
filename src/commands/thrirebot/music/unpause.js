import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus } from "@discordjs/voice";
import AudioType from "../../../enums/AudioType.js";
import discordJSVoice from "../../../facades/discordJSVoice.js";

export default
{
    data: new SlashCommandBuilder()
        .setName("unpause")
        .setDescription("Retoma a música pausada."),
    execute: async ({client, interaction}) =>
    {
        await interaction.deferReply();
        {
            if (discordJSVoice.audioType !== AudioType.MUSIC || discordJSVoice.getStatus(client) === AudioPlayerStatus.Idle)
                return interaction.editReply({ content: '❌ Nenhuma música está tocando.' });
            await discordJSVoice.unpause(client);
        }
        await interaction.deleteReply();
    }
};