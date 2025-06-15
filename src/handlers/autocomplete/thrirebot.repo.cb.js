// src/handlers/thrirebot.repo.cb.js
import { Octokit } from "octokit";
import fs from "fs/promises";
import { decrypt } from "../../utils/crypto.js";

export async function handleAutocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const userId = interaction.user.id;

    try {
        const raw = await fs.readFile('./github_credentials.json', 'utf8');
        const credentials = JSON.parse(raw);
        const token = decrypt(credentials[userId]?.token);
        if (!token) return;

        const octokit = new Octokit({ auth: token });

        const response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
            owner: 'thrireltda',
            repo: 'thrirebot'
        });

        const branches = response.data.map(b => b.name);

        const filtered = branches
            .filter(branch => branch.includes(focusedOption.value))
            .slice(0, 25)
            .map(branch => ({ name: branch, value: branch }));

        await interaction.respond(filtered);
    } catch (error) {
        console.error("Erro no autocomplete:", error);
        await interaction.respond([]);
    }
}