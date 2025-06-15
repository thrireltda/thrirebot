import { config } from 'dotenv';
config();
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import client from './bot.js';
import loadCommands from './loader.js';
import {EmbedBuilder, Events} from 'discord.js';
import { useMainPlayer } from 'discord-player';
import freegames from './freegames.js';


// 1. Carregue os comandos
loadCommands(client);
// 2. Prepare as rotas para registrar comandos
client.once('ready', async () =>
{
    const commands = client.commands.map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    const guild_ids = client.guilds.cache.map(guild => guild.id);

    for (const guildId of guild_ids)
    {
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands })
        .catch(console.error);
    }
});
// 3. Gerencie interações
client.on(Events.InteractionCreate, async interaction =>
{
    client.on(Events.InteractionCreate, async interaction =>
    {
        const command = interaction.commandName;                      // "gh"
        const group = interaction.options.getSubcommandGroup(false); // "pr"
        const sub = interaction.options.getSubcommand(false);        // "approve"
        const baseName = [command, group, sub].filter(Boolean).join(".");
        if (interaction.isAutocomplete())
        {
            try {
                const handler = await import(`./handlers/autocomplete/${baseName}.js`).then(m => m.default);
                return handler(interaction);
            } catch (e) {
                console.warn("🔎 Sem autocomplete handler para:", baseName);
            }
        }
        if (interaction.isChatInputCommand())
        {
            try {
                const handler = await import(`./handlers/commands/${baseName}.js`).then(m => m.default);
                return handler({ interaction, client });
            } catch (e) {
                console.warn("🔎 Sem command handler para:", baseName);
            }
        }
    });
});
useMainPlayer().events.on('playerStart', (queue, track) =>
{
    const embed = new EmbedBuilder()
    .setDescription(`Tocando **[${track.title}](${track.url})**`)
    .setThumbnail(track.thumbnail)
    .setFooter({ text: `Duração: ${track.duration}` });

    // we will later define queue.metadata object while creating the queue
    queue.metadata.channel.send({ embeds: [embed] });
});
// 4. Faça login
client.login(process.env.TOKEN);
// 5. Cron
freegames.execute(client);