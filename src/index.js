require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const client = require('./bot');
const loadCommands = require('./loader');
const { Events } = require('discord.js');

// 1. Carregue os comandos
loadCommands(client);

// 2. Prepare as rotas para registrar comandos
client.once('ready', async () =>
{
    console.log(`Logado como ${client.user.tag}`);
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
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try
    {
        await command.execute({ client, interaction });
    }
    catch (e)
    {
        console.error(e);
        await interaction.reply({ content: "Ocorreu um erro.", ephemeral: true });
    }
});

// 4. Faça login
client.login(process.env.TOKEN);