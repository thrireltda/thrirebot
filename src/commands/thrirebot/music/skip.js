import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus } from "@discordjs/voice";
import AudioType from "../../../enums/AudioType.js";
import discordJSVoice from "../../../facades/discordJSVoice.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("skip")
        .setDescription("Pula para a próxima música da fila."),
    execute: async ({ interaction, client }) =>
    {
        await interaction.deferReply();
        {
            if (discordJSVoice.audioType !== AudioType.MUSIC || discordJSVoice.getStatus(client) === AudioPlayerStatus.Idle)
                return interaction.editReply({ content: '❌ Nenhuma música está tocando.' });
            await discordJSVoice.skip(interaction, client);
        }
        await interaction.deleteReply();
    }
};