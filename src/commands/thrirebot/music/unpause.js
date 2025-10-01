import createsubcommand from "#utils/createsubcommand.js";
import djsv from "#facades/discordJSVoice.js";

export default {
    data: await createsubcommand("unpause", "Despausa a música / playlist tocando"),
    execute: async ({client, interaction}) => {
        await interaction.deferReply()
        await djsv.unpause(client);
        await interaction.deleteReply();
    }
};