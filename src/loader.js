import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

async function loadCommands(client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles)
    {
        const filePath = path.join(commandsPath, file);
        const fileUrl = pathToFileURL(filePath);
        const commandModule = await import(fileUrl.href);
        const command = commandModule.default || commandModule;
        client.commands.set(command.data.name, command);
    }
}

export default loadCommands;
