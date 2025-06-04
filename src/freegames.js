import { EmbedBuilder } from 'discord.js';
import cron from 'node-cron';
import fetch from 'node-fetch';

const CHANNEL_ID = '1379279495747469474';

export default {
    name: "dailyFreeGames",
    once: true,
    execute(client) {
        cron.schedule('0 11 * * *', async () => {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel) return;

            try {
                const res = await fetch('https://www.gamerpower.com/api/giveaways?type=game');
                const giveaways = await res.json();

                const onlyPaid = giveaways.filter(g => g.worth !== "N/A" && g.worth !== "0.00");

                if (onlyPaid.length === 0) return;

                const embed = new EmbedBuilder()
                    .setTitle("🎮 Jogos pagos gratuitos hoje!")
                    .setColor(0x00AE86)
                    .setDescription(
                        onlyPaid.slice(0, 5).map(g =>
                            `• [${g.title}](${g.open_giveaway_url}) — ${g.worth} (${g.platforms})`
                        ).join('\n')
                    )
                    .setFooter({ text: `Fonte: gamerpower.com` })
                    .setTimestamp();

                channel.send({ embeds: [embed] });

            } catch (error) {
                console.error("Erro ao buscar jogos grátis:", error);
            }
        });
    }
};
