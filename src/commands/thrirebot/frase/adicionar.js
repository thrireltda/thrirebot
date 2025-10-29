import createsubcommand from "#utils/createsubcommand.js";
import fetchendpoint from "#utils/fetchendpoint.js";
import createembed from "#utils/createembed.js";

export default {
    data: await createsubcommand("adicionar", "Adiciona uma frase do dia na da API da Thrire.", [
        { type: String, name: "frase", description: "Frase para adicionar", autocomplete: false, required: true },
    ]),
    execute: async ({ interaction }) => {
        await interaction.deferReply();
        const data = await fetchendpoint(
            `${process.env.THRIRE_API}/dailyphrase`,
            "POST",
            { 'Content-Type': 'application/json' },
            JSON.stringify({ phrase_text: interaction.options.getString('frase') } )
        )
        if (data.code !== 200) {
            await interaction.editReply({ embeds: [ await createembed(null, `❌ Ocorreu um erro ao processar sua requisição.\n\`\`\`${data.response}\`\`\``, null, "Red")]})
            return;
        }
        await interaction.editReply({ embeds: [ await createembed(null, `✅ Frase adicionada com sucesso`) ] });
    }
};