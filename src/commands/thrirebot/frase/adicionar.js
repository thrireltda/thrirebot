import { SlashCommandSubcommandBuilder } from '@discordjs/builders';

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName('adicionar')
        .setDescription('Adiciona uma frase do dia na da API da Thrire.')
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Frase para adicionar")
                .setRequired(true)
        ),
    execute: async ({ interaction }) =>
    {
        let reply;
        await interaction.deferReply();
        {
            const query = interaction.options.getString('query');
            await fetch(`${process.env.THRIRE_API}/dailyphrase/dailyphrase`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phrase_text: query }),
            })
            .then(response =>
            {
                switch (response.ok)
                {
                    case true:
                        reply = `✅ Frase adicionada com sucesso`;
                        break;
                    case false:
                        reply = `❌ Ocorreu um erro ao processar sua requisição.`;
                        break;
                }
            })
            .catch(console.error);
        }
        await interaction.editReply(reply);
    }
};