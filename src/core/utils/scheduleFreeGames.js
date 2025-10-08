import fetchendpoint from "#utils/fetchendpoint.js";
import createembed from "#utils/createembed.js";

export default {
    expression: '0 11 * * *',
    action: async function(client) {
        const channel = await client.channels.fetch('1379279495747469474');
        if (!channel) return;
        const data = await fetchendpoint(`https://www.gamerpower.com/api/giveaways?type=game`);
        if (data === undefined) return;
        const filtered = data.filter(g => g.worth !== "N/A" && g.worth !== "0.00");
        if (filtered.length === 0) return;
        await channel.send({ embeds: [ await createembed("🎮 Jogos pagos gratuitos hoje!", filtered.slice(0, 5).map(g => `• [${g.title}](${g.open_giveaway_url}) — ${g.worth} (${g.platforms})`).join('\n'), null, 0x00AE86, { text: `Fonte: gamerpower.com` }, true)] });
    }
}