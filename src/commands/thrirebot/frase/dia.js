import createsubcommand from "#utils/createsubcommand.js";
import fetchendpoint from "#utils/fetchendpoint.js";
import createembed from "#utils/createembed.js";

export default {
    data: await createsubcommand("dia", "Busca a frase do dia a partir da API da Thrire."),
    execute: async ({ interaction }) => {
        await interaction.deferReply();
        const data = await fetchendpoint(`${process.env.THRIRE_API}/v1/dailyphrase`)
        if (!data.response) await interaction.editReply({ embeds: [ createembed(null, `❌ Ocorreu um erro ao processar sua requisição.\n\`\`\`${data.error.message}\`\`\``, null, "Red") ] })
        await interaction.editReply({ embeds: [ createembed(`✅ Frase do dia`, data.response) ] });
    }
};