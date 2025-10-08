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
            `${process.env.THRIRE_API}/v1/dailyphrase`,
            "POST",
            { 'Content-Type': 'application/json' },
            JSON.stringify({ phrase_text: interaction.options.getString('query') } )
        )
        if (!data.response) await interaction.editReply({ embeds: [ createembed(null, `❌ Ocorreu um erro ao processar sua requisição.\n\`\`\`${data.error.message}\`\`\``, null, "Red") ] })
        await interaction.editReply({ embeds: [ createembed(`✅ Frase adicionada com sucesso`) ] });
    }
};