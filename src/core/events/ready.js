import bldr from "#facades/bldr.js";
import Scheduler from "#facades/Scheduler.js";
import scheduleFreeGames from "#utils/scheduleFreeGames.js";

export default {
    name: "ready",
    once: true,
    async execute(client) {
        await bldr.buildCommandTree(client);
        await Scheduler.registerJob(client, [scheduleFreeGames])
        console.log(`[BOT] Online como ${client.user.tag}`);
    }
};
