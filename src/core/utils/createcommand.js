import { SlashCommandBuilder } from "@discordjs/builders";

export default async function(name, description) {
    const command = new SlashCommandBuilder();
    if (name) command.setName(name);
    if (description) command.setDescription(description);
    return command;
}