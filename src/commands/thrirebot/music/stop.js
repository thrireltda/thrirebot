import createsubcommand from "#utils/createsubcommand.js";
import djsv from "#facades/djsv.js";

export default {
    data: await createsubcommand("stop", "Limpa a fila atual de músicas / playlists."),
    execute: async ({ client, interaction }) => {
        //todo: checar se musica está tocando
        await interaction.deferReply()
        await djsv.stop(client);
        await interaction.deleteReply();
    }
};