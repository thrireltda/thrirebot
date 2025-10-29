import createsubcommand from "#utils/createsubcommand.js";
import fetchendpoint from "#utils/fetchendpoint.js";
import createembed from "#utils/createembed.js";
import vc from "#facades/vc.js";
import djsv from "#facades/djsv.js";
import { AudioPlayerStatus } from "@discordjs/voice";
import AudioType from "#enums/AudioType.js";
import invokeFfmpeg from "#utils/invokeFfmpeg.js";
import invokeEspeakng from "#utils/invokeEspeakng.js";

export default {
    data: await createsubcommand("question", "Faça um pergunta para um agente de IA", [
        { type: String, name: "model", description: "Modelo para ser utilizado", autocomplete: true, required: true },
        { type: String, name: "prompt", description: "Prompt para ser executado", autocomplete: false, required: true },
        { type: String, name: "search", description: "Buscar fatos na web?", autocomplete: true, required: false }
    ]),
    execute: async ({ interaction, client }) =>  {
        await interaction.deferReply();
        const data = await fetchendpoint(
            `${process.env.THRIRE_API}/askquestion`,
            "POST",
            { 'Content-Type': 'application/json' },
            JSON.stringify({ model: interaction.options.getString('model'), prompt: interaction.options.getString('prompt'), search: interaction.options.getString('search') === 'true' })
        )
        if (data.code !== 200) {
            await interaction.editReply({ embeds: [ await createembed(null, `❌ Ocorreu um erro ao processar sua requisição.\n\`\`\`${data.response}\`\`\``, null, "Red") ] })
            return;
        }
        await interaction.editReply({ embeds: [ await createembed(null, `${data.response}`) ] });
        if (!interaction.member.voice.channel) return;
        if (!vc.getConnection(interaction)) await vc.join(interaction, client);
        if (djsv.getStatus(client) === AudioPlayerStatus.Playing && djsv.audioType !== AudioType.ESPEAK) return;
        const ffmpeg = await invokeFfmpeg(client);
        const stdout = await invokeEspeakng(client, ffmpeg, data.response);
        await djsv.play(client, stdout, AudioType.ESPEAK);
    },
    autocomplete: async ({ interaction }) => {
        const name = interaction.options.getFocused(true).name.toLowerCase();
        const value = interaction.options.getFocused(true).value.toLowerCase();
        switch (name) {
            case 'model':
                const data = await fetchendpoint(`${process.env.THRIRE_API}/aimodels?opt=0`)
                if (data === undefined) break;
                await interaction.respond(data.models.filter(c => c.name.toLowerCase().includes(value)).map(c => ({ name: c.name, value: c.name })));
                break;
            case 'search':
                await interaction.respond(['true', 'false'].filter(v => v.startsWith(value)).map(v => ({ name: v, value: v })));
                break;
        }
    }
};