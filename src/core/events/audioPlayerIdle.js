export default {
    name: "audioPlayerIdle",
    async execute(client, interaction) {
        client.emit("playMusic", interaction);
    }
}