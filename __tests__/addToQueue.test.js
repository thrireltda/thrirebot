import { Client, GatewayIntentBits } from 'discord.js'
import djsv from '#facades/djsv.js'
import { expect, test } from '@jest/globals'
import { createAudioPlayer } from '@discordjs/voice'

test('add to queue', async () => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates,
        ],
    })
    client.audioPlayer = await createAudioPlayer();
    client.audioPlayer.musicQueue = [];
    djsv.addToQueue('', client, null)
    expect(djsv.getQueueSize(client)).toBe(1)
})
