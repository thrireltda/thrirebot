// src/handlers/autocomplete/gh.pr.approve.js
import { Octokit } from "octokit";
import { readFile } from "fs/promises";
import { decrypt } from "../../utils/crypto.js";
import { getCache, setCache } from "../../utils/cache.js";

export default async function (interaction) {
    const userId = interaction.user.id;
    const focused = interaction.options.getFocused(true);
    const focusedName = focused.name;
    const query = focused.value.toLowerCase();

    let token;
    try {
        const raw = await readFile("./github_credentials.json", "utf8");
        const credentials = JSON.parse(raw);
        token = decrypt(credentials[userId]?.token);
        if (!token) return safelyRespond(interaction, []);
    } catch (e) {
        console.error("Erro ao obter token:", e);
        return safelyRespond(interaction, []);
    }

    const octokit = new Octokit({ auth: token });

    try {
        if (focusedName === "repo") {
            const response = await octokit.request("GET /orgs/{org}/repos", {
                org: "thrireltda"
            });

            const repos = response.data
                .filter(r => r.name.toLowerCase().includes(query.toLowerCase())) // mesmo se query === ""
                .slice(0, 25)
                .map(r => ({ name: r.name, value: r.name }));

            return safelyRespond(interaction, repos); // já está tratando erro
        }

        if (focusedName === "pr") {
            const repo = interaction.options.getString("repo");
            if (!repo) return safelyRespond(interaction, []);

            const response = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
                owner: "thrireltda",
                repo,
                state: "open"
            });

            const prs = response.data
                .filter(pr => pr.title.toLowerCase().includes(query))
                .slice(0, 25)
                .map(pr => ({
                    name: `#${pr.number} - ${pr.title.slice(0, 80)}`,
                    value: pr.number.toString()
                }));

            return safelyRespond(interaction, prs);
        }

        return safelyRespond(interaction, []);
    } catch (e) {
        console.error("Erro no autocomplete:", e);
        return safelyRespond(interaction, []);
    }
}

async function safelyRespond(interaction, choices)
{
    try { if (!interaction.responded) await interaction.respond(choices); }
    catch (e) { /* Ignore */ }
}
