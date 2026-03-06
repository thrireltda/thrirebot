import djsv from "#facades/djsv.js";
import { AudioPlayerStatus } from "@discordjs/voice";

export default {
    name: "playerQueueIncreased",
    async execute(client, interaction) {
        if (djsv.getStatus(client) === AudioPlayerStatus.Idle)
            client.emit("playMusic", interaction);
    }
}