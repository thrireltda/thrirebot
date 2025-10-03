import createsubcommand from "#utils/createsubcommand.js";
import djsv from "#facades/djsv.js";

export default {
    data: await createsubcommand("pause", "Pausa a música / playlist tocando"),
    execute: async ({client, interaction}) => {
        await interaction.deferReply()
        await djsv.pause(client);
        await interaction.deleteReply();
    }
};