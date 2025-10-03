import createsubcommand from "#utils/createsubcommand.js";
import vc from "#facades/vc.js";
import djsv from "#facades/djsv.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import AudioType from "../../../core/enums/AudioType.js";
import ytSearch from 'yt-search';
import createembed from "#utils/createembed.js";

export default {
    data: await createsubcommand("play", "Toca uma música / playlist", [
        { type: String, name: "query", description: "Nome ou link da música / playlist", autocomplete: false, required: true },
    ]),
    execute: async ({ interaction, client }) => {
        await interaction.deferReply();
        if (!vc.connection) await vc.join(interaction, client);
        if (djsv.getStatus(client) === AudioPlayerStatus.Playing && djsv.audioType !== AudioType.MUSIC) await djsv.stop(client);
        const query = interaction.options.getString("query");
        const queryResults = await ytSearch(query);
        if (!queryResults) return;
        const selectedResult = queryResults.videos[0];
        await djsv.addToQueue(interaction, client, selectedResult);
        await interaction.editReply({ embeds: [ await createembed("🎵 Música adicionada à fila", `**[${selectedResult.title}](${selectedResult.url})**`, selectedResult.thumbnail, null, { text: `Solicitada por ${interaction.user.username}` }) ] });
    }
};