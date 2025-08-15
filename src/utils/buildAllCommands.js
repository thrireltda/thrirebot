import { REST, Routes } from "discord.js";
import builder from "./builder.js";

export default async function(client)
{
    const commands = await builder();
    client.commands = commands;

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands.map(cmd => cmd.data.toJSON()) });
}