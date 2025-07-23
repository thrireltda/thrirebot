import { REST, Routes, Events } from 'discord.js';
import buildAllCommands from '../utils/builder.js';
import { scheduleDailyFreeGames } from '../cron/freegames.js';

export default
{
    name: Events.ClientReady,
    once: true,
    async execute(client)
    {
        const commandList = await buildAllCommands();
        client.commands = commandList;

        const slashData = commandList.map(cmd => cmd.data.toJSON());
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        try
        {
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: slashData });
        }
        catch (error)
        {
            console.error('❌ Falha ao registrar comandos:', error);
        }

        console.log(`[BOT] Online como ${client.user.tag}`);
        scheduleDailyFreeGames(client);
    }
};
