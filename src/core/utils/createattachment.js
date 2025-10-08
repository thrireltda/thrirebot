import { AttachmentBuilder } from "discord.js";

export default async function (stream) {
    return new AttachmentBuilder(stream, { name: "image.png" });
}