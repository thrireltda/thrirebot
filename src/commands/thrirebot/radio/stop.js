import createsubcommand from "#utils/createsubcommand.js";
import djsv from "#facades/djsv.js";

export default
{
    data: await createsubcommand("stop", "Para a rádio e desconecta do canal de voz."),
    execute: async ({ client, interaction }) =>
    {
        await interaction.deferReply()
        await djsv.stop(client);
        await interaction.deleteReply();
    }
};