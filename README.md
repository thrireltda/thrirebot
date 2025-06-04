# thrirebot

## Comandos de IA

### `/pergunta`

Envia uma pergunta para a IA (ChatGPT) e retorna a resposta. Defina a variável de ambiente `OPENAI_API_KEY` para utilizar.

### `/codex`

Envia uma solicitação ao Codex para gerar código e criar uma pull request automaticamente no repositório configurado.
Se a descrição iniciar com um nome de comando (ex.: `/ping`), um novo arquivo JavaScript será gerado em `src/commands` com a implementação retornada pela IA.
Defina a variável `GITHUB_BOT_API_KEY` com o token do usuário **thrirebot** para que a PR seja criada por ele (caso não definido, `GITHUB_API_KEY` ainda é utilizado). Opcionalmente ajuste `PR_REPO_OWNER` e `PR_REPO_NAME`.
