import createsubcommand from "#utils/createsubcommand.js";
import fetchendpoint from "#utils/fetchendpoint.js";
import createembed from "#utils/createembed.js";

export default {
    data: await createsubcommand("dia", "Busca a frase do dia a partir da API da Thrire."),
    execute: async ({ interaction }) => {
        await interaction.deferReply();
        const data = await fetchendpoint(`${process.env.THRIRE_API}/dailyphrase`)
        if (data.code !== 200) {
            await interaction.editReply({embeds: [await createembed(null, `❌ Ocorreu um erro ao processar sua requisição.\n\`\`\`${data.response}\`\`\``, null, "Red")]})
            return;
        }
        await interaction.editReply({ embeds: [ await createembed(`✅ Frase do dia`, data.response) ] });
    }
};