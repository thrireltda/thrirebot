import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { AudioPlayerStatus } from "@discordjs/voice";
import ytSearch from 'yt-search';
import djsv from "../../../facades/discordJSVoice.js";
import AudioType from "../../../enums/AudioType.js";
import playNext from "../../../services/playNext.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName("play")
        .setDescription("Toca uma música")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Nome ou link da música")
                .setRequired(true)
        ),
    execute: async ({ interaction, client }) =>
    {
        const embed = new EmbedBuilder();
        await interaction.deferReply();
        {
            if (djsv.getStatus(client) === AudioPlayerStatus.Playing && djsv.audioType === AudioType.RADIO)
                await djsv.stop(client);
            const query = interaction.options.getString("query");
            const queryResults = await ytSearch(query);
            if (!queryResults) return;
            const selectedResult = queryResults.videos[0];
            djsv.addToQueue(client, selectedResult);
            embed.setTitle("🎵 Música adicionada à fila")
            .setDescription(`**[${selectedResult.title}](${selectedResult.url})**`)
            .setThumbnail(selectedResult.thumbnail)
            .setFooter({ text: `Solicitada por ${interaction.user.username}` });
            if (djsv.getStatus(client) === AudioPlayerStatus.Idle) await playNext(interaction, client);
        }
        await interaction.editReply({ embeds: [embed] });
    }
};