# Voll Crédito

Demo da jornada de financiamento com layout do delivery: ficha do cliente no topo, nove etapas na vertical e histórico lateral.

Todas as etapas têm botões. Os passos 4 e 5 acionam o Voll Workflows para o telefone editável do cliente. As outras etapas avançam a demonstração local.

- Passo 4: `WHATSAPP`, até três tentativas por sessão.
- Passo 5: `VOICE`, quando necessário.
- Botões bloqueados durante o processamento. O sucesso confirma aceite da API, não a entrega da mensagem ou atendimento da ligação.

## Executar

Requer Node.js 22.13 ou superior. Sem dependências externas ou build.

```bash
cp .env.example .env
# Preencha VOLL_API_KEY no .env
npm start
```

Abra http://localhost:3000. O comando lê o `.env` automaticamente. Em hospedagem, configure `VOLL_API_KEY` como variável de ambiente. `PORT` define a porta (padrão 3000).

## Integração

O navegador faz `POST /api/trigger`. O servidor valida e encaminha ao gatilho `22a4895d-bba7-4b8b-8ad0-13a154ebeb2e`, em `produtos.vollsc.com`, com o body do delivery:

```json
{"action":"WHATSAPP","whatsapp":"5511999999999","try":1,"to":"1007"}
```

No passo 5, `action` é `VOICE`. O destino `1007` representa o cliente nos dois passos. `try` avança no WhatsApp; a voz usa a tentativa atual, com mínimo 1.

A chave vem exclusivamente de `process.env.VOLL_API_KEY`. Nunca é incluída no HTML nem no repositório. O painel Configuração mostra o último body e o resultado HTTP.

## Render

Importe como Web Service ou use o Blueprint `render.yaml`. Configure `VOLL_API_KEY` no painel do Render. Build: `npm install`. Start: `npm start`. Health check: `/health`.

## Verificar

```bash
npm run check
```

Este repositório contém a versão portátil em Node.js, com a mesma página e comportamento da demo publicada no ChatGPT Sites, para execução local ou no Render como no delivery.
