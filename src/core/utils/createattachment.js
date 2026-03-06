import { AttachmentBuilder } from "discord.js";

/**
 * @param {import("node:stream") | import("discord.js").BufferResolvable} stream
 */
export default async function (stream) {
    return new AttachmentBuilder(stream, { name: "image.png" });
}