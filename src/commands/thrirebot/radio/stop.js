import createsubcommand from "#utils/createsubcommand.js";
import djsv from "#facades/djsv.js";

export default {
    data: await createsubcommand("stop", "Para a rádio. "),
    execute: async ({ client, interaction }) => {
        // todo: checar se rádio está tocando
        await interaction.deferReply()
        await djsv.stop(client);
        await interaction.deleteReply();
    }
};