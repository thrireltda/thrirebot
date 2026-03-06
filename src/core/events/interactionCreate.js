export default {
    name: "interactionCreate",
    async execute(client, interaction) {
        const commandList = client.commands;
        if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;
        const cmd = commandList.find(c => c.data.name === interaction.commandName);
        if (!cmd) return;
        if (interaction.isChatInputCommand() && cmd.execute) return cmd.execute(client, interaction);
        if (interaction.isAutocomplete() && cmd.autocomplete) return cmd.autocomplete(client, interaction);
    }
};
