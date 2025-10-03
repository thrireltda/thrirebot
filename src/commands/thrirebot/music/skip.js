import djsv from "#facades/djsv.js";
import createsubcommand from "#utils/createsubcommand.js";

export default {
    data: await createsubcommand("skip", "Pula a música / playlist tocando."),
    execute: async ({ interaction, client }) => {
        await interaction.deferReply()
        await djsv.skip(client);
        await interaction.deleteReply();
    }
};