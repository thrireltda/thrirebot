const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { QueryType, useMainPlayer} = require('discord-player');

module.exports =
{
    data: new SlashCommandBuilder().setName("play").setDescription("Plays a song from youtube").addStringOption(option =>
    {
        return option.setName("url").setDescription("url of the song").setRequired(true);
    }),
    execute: async ({client, interaction}) =>
    {
        //Todo: not in a voice channel

        const queue = await client.player.queues.create(interaction.guild)
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        let url = interaction.options.getString("url");
        const mainPlayer = useMainPlayer();
        const result = await mainPlayer.search(url,
        {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_VIDEO,
        });

        if (result.tracks.length === 0)
        {
            return interaction.reply({
                content: "❌ Nenhuma música foi encontrada.",
                ephemeral: true
            });
        }

        const song = result.tracks[0];
        await queue.addTrack(song);
        if (!queue.isPlaying()) await queue.node.play();

        let embed = new EmbedBuilder()
        .setDescription(`Added **[${song.title}](${song.url})** to the queue`)
        .setThumbnail(song.thumbnail)
        .setFooter({text: `Duration: ${song.duration}`});
        await interaction.reply({embeds: [embed]});
    }
};