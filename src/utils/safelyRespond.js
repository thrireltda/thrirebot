export default async function (interaction, choices)
{
    try
    {
        if (!interaction.responded)
            await interaction.respond(choices);
    }
    catch { }
}
