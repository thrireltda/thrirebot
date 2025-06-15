// src/handlers/commands.js
export async function handleCommand({ interaction, client }) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute({ client, interaction });
    } catch (e) {
        console.error("Erro no comando:", e);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "❌ Ocorreu um erro.", ephemeral: true });
        }
    }
}
