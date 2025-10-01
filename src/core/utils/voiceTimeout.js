// utils/voiceTimeout.js
const voiceTimeouts = new Map();

export default (guildId, connection, delay = 15000) =>
{
    if (voiceTimeouts.has(guildId))
    {
        clearTimeout(voiceTimeouts.get(guildId));
    }

    const timeout = setTimeout(() =>
    {
        try
        {
            connection.destroy();
        }
        catch {}

        voiceTimeouts.delete(guildId);

    }, delay);

    voiceTimeouts.set(guildId, timeout);
}
