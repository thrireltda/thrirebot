import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import DiscordJSVoiceLib from "../../../facades/discordJSVoice.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("stop")
        .setDescription("Para a música e limpa a fila."),
    execute: async ({ client, interaction }) =>
    {
        await interaction.deferReply({ ephemeral: true });
        {
            if (!client.audioPlayer || !client.audioPlayer.isPlaying) return interaction.editReply({ content: '❌ Nenhuma música está tocando.' });
            await DiscordJSVoiceLib.stop(client);
        }
        await interaction.deleteReply();
    }
};