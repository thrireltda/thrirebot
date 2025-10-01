import { EmbedBuilder } from "discord.js";

export default async function(title, description, thumbnail, color, footer)
{
    const embed = new EmbedBuilder();
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (color) embed.setColor(color);
    if (footer) embed.setFooter(footer);
    return embed;
}