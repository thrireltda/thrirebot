# thrirebot

## Comandos de IA

### `/pergunta`

Envia uma pergunta para a IA (ChatGPT) e retorna a resposta. Defina a variável de ambiente `OPENAI_API_KEY` para utilizar.

### `/codex`

Envia uma solicitação ao Codex para gerar patches de código e cria uma pull request automaticamente no repositório configurado. Para funcionar também é necessário definir `GITHUB_API_KEY` e, opcionalmente, `PR_REPO_OWNER` e `PR_REPO_NAME`.
