import playNext from "../services/playNext.js";

export default
{
    name: "audioPlayerIdle",
    async execute(interaction, client)
    {
        await playNext(interaction, client);
    }
}