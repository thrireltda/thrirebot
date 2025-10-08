export default {
    name: "interactionCreate",
    async execute(interaction) {
        const client = interaction.client;
        const commandList = client.commands;
        if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;
        const cmd = commandList.find(c => c.data.name === interaction.commandName);
        if (!cmd) return;
        if (interaction.isChatInputCommand() && cmd.execute) return cmd.execute({ interaction, client });
        if (interaction.isAutocomplete() && cmd.autocomplete) return cmd.autocomplete({ interaction, client });
    }
};
