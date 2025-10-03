/*
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import voiceConnection from "../../../core/facades/vc.js";

export default
{
    data: new SlashCommandSubcommandBuilder()
        .setName('join')
        .setDescription('Faz o bot entrar no seu canal de voz'),
    async execute({ interaction, client })
    {
        //todo: verificar se bot não está na call

        await interaction.deferReply();
        {
            const channel = interaction.member.voice.channel;
            if (!channel) return interaction.editReply("Você precisa estar em um canal de voz para usar este comando.");
            await voiceConnection.join(interaction, client)
        }
        await interaction.deleteReply();
    }
};*/
