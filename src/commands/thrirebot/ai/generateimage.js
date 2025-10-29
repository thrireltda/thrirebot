import createsubcommand from "#utils/createsubcommand.js";
import fetchendpoint from "#utils/fetchendpoint.js";
import createembed from "#utils/createembed.js";
import createattachment from "#utils/createattachment.js";

export default {
    data: await createsubcommand("generateimage", "Gera uma imagem a partir de um prompt.", [
        { type: String, name: "model", description: "Modelo para ser utilizado", autocomplete: true, required: true },
        { type: String, name: "prompt", description: "Prompt para ser executado", autocomplete: false, required: true },
    ]),
    execute: async ({ interaction }) => {
        await interaction.deferReply();
        const data = await fetchendpoint(
            `${process.env.THRIRE_API}/generateimage`,
            "POST",
            { 'Content-Type': 'application/json' },
            JSON.stringify({ model: interaction.options.getString('model'), prompt: interaction.options.getString('prompt') })
        )
        if (data.code !== 200) {
            await interaction.editReply({ embeds: [ await createembed(null, `❌ Ocorreu um erro ao processar sua requisição.\n\`\`\`${data.response}\`\`\``, null, "Red") ] })
            return;
        }
        await interaction.editReply({ files: [ await createattachment(Buffer.from(data.response, "base64")) ] });
    },
    autocomplete: async ({ interaction }) => {
        const name = interaction.options.getFocused(true).name.toLowerCase();
        const value = interaction.options.getFocused(true).value.toLowerCase();
        switch (name) {
            case 'model':
                const data = await fetchendpoint(`${process.env.THRIRE_API}/aimodels?opt=1`);
                if (data === undefined) break;
                await interaction.respond(data.models.filter(c => c.name.toLowerCase().includes(value)).map(c => ({ name: c.name, value: c.name })));
                break;
        }
    }
};