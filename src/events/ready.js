import { Events } from 'discord.js';
import buildAllCommands from '../utils/buildAllCommands.js';
import scheduleDailyFreeGames from '../utils/scheduleDailyFreeGames.js';

export default
{
    name: Events.ClientReady,
    once: true,
    async execute(client)
    {
        await buildAllCommands(client);
        await scheduleDailyFreeGames(client);
        console.log(`[BOT] Online como ${client.user.tag}`);
    }
};
