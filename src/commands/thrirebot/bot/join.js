import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import joinVoiceChannel from "../../../services/joinVoiceChannel.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName('join')
        .setDescription('Faz o bot entrar no seu canal de voz'),
    async execute({ interaction, client })
    {
        //todo: verificar se bot não está na call

        await interaction.deferReply({ ephemeral: true });
        {
            const channel = interaction.member.voice.channel;
            if (!channel) return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
            joinVoiceChannel(channel, interaction.guild, client)
        }
        await interaction.deleteReply();
    }
};