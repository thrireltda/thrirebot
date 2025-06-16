import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com pong'),

    execute: async ({ interaction }) => {
        await interaction.reply('🏓 Pong!');
    }
};