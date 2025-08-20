import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus } from "@discordjs/voice";
import discordJSVoice from "../../../facades/discordJSVoice.js";
import AudioType from "../../../enums/AudioType.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("stop")
        .setDescription("Para a música e limpa a fila."),
    execute: async ({ client, interaction }) =>
    {
        await interaction.deferReply();
        {
            if (discordJSVoice.audioType !== AudioType.MUSIC || discordJSVoice.getStatus(client) === AudioPlayerStatus.Idle)
                return interaction.editReply({ content: '❌ Nenhuma música está tocando.' });
            await discordJSVoice.stop(client);
        }
        await interaction.deleteReply();
    }
};