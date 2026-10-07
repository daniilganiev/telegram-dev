# Telegram Dev: Claude plugin

A Claude plugin for building in Telegram the right way: bots in TypeScript or Python, Mini Apps
with server-side `initData` validation, Telegram Stars payments and the rules around them, and
TON where it meets Telegram (TON Connect, wallet login, TON and jetton payments, NFTs, Tolk
contracts). It focuses on the mistakes that cost money or get a bot hidden, and on API changes
newer than most answers you'll find. Community project, **not affiliated with or endorsed by
Telegram or the TON Foundation**.

**RU:** Плагин для Claude, чтобы делать в Telegram правильно: боты на TypeScript или Python,
Mini Apps с проверкой `initData` на сервере, платежи в Stars и правила вокруг них, и TON там,
где он касается Telegram. Проект сообщества, не связан с Telegram и TON Foundation.

## What's inside

### Skills (Claude loads them automatically when relevant)

| Skill | What it does |
|---|---|
| `telegram-dev` | Where to start: bot, Mini App or channel, how to charge, whether you need a blockchain at all |
| `telegram-bot` | grammY and aiogram bots: webhooks, limits, broadcasts, channel automation, AI bots with streaming, Business and managed bots, Bot API changes of 2026 |
| `telegram-mini-app` | Mini Apps: SDK, theming, safe areas, storage, `initData` validation in TS and Python |
| `telegram-payments` | Stars: invoices, pre-checkout, refunds, subscriptions, paid media, gifts, go-live requirements |
| `telegram-ton` | TON Connect, `ton_proof`, accepting TON and jettons, NFTs, reading the chain via TON Center, Tolk contracts |
| `telegram-launch` | Release checklist, monitoring, monetization |

### Commands

| Command | What it does |
|---|---|
| `/telegram-dev:new-bot <name> [ts\|py]` | New grammY or aiogram bot, webhook-ready |
| `/telegram-dev:new-mini-app <name> [ton]` | New Mini App with a backend; with `ton`, a contract and TON Connect via Acton |
| `/telegram-dev:add-payments [what you sell]` | Payments in an existing project, Stars by default |
| `/telegram-dev:add-ton-connect` | Wallet connection and login with `ton_proof` |
| `/telegram-dev:audit-project` | Pre-release audit: secrets, build, tests, reviewers |
| `/telegram-dev:deploy-testnet [script]` | Testnet deployment: build, tests, emulation, the command for you to run, on-chain check |

### Agents

`telegram-security-reviewer` (bot, Mini App, payments), `ton-security-reviewer` (contracts),
`tolk-test-writer` (Tolk tests).

### Hooks

Local Node scripts that send nothing anywhere:
- refuse to write a bot token, seed phrase or private key into source files (`.env` is exempt);
- block passing `MNEMONIC`/`PRIVATE_KEY`/`BOT_TOKEN` inline in a command, reading `.env` and
  `wallets.toml`, and `acton wallet export-mnemonic`;
- block any transaction broadcast (`acton script --net`, mainnet commands) and faucet requests:
  the user runs those in their own terminal;
- run `acton build` after a `.tolk` edit and show compile errors (if Acton is installed; on
  Windows the hook calls Acton inside WSL).

The plugin ships no MCP servers, holds no wallets and never signs transactions. Anything that
moves money is signed by the user in their own wallet.

## Examples

Ask Claude in plain language; the plugin's skills load on their own.

1. "Build a Telegram bot in Python that sells a 50 Stars sticker pack, with refunds." Claude
   uses `telegram-bot` and `telegram-payments`: aiogram handlers, a fast pre-checkout check,
   delivery only on `successful_payment`, idempotent on the charge id, `/terms` and `/paysupport`.
2. "I want to sell extra lives in my Mini App game for TON." Claude explains that digital goods
   inside Telegram must be paid in Stars, proposes a Stars checkout, and keeps TON for things
   like NFT rewards or payouts.
3. "Validate initData on my FastAPI backend." Claude writes the HMAC check with the `WebAppData`
   key, constant-time comparison and an `auth_date` limit, and explains why `initDataUnsafe` is
   not trusted.
4. "Stream my LLM answers into the Telegram chat as they are generated." Claude uses
   `sendMessageDraft` with a stable `draft_id` and finishes with `sendMessage` so the reply stays.
5. `/telegram-dev:new-bot shop-bot ts`, then `/telegram-dev:add-payments` — a webhook-ready
   grammY bot with Stars payments and tests.

## What the plugin runs, sends and fetches

- **Hooks** (`scripts/`, Node.js) read the tool call Claude is about to make and decide whether to
  block it. They send nothing over the network and write nothing to disk.
- **`after-tolk-edit`** runs `acton build` in the edited Acton project; on Windows it runs it through
  `wsl.exe` inside WSL. Nothing else is executed.
- **Skills and commands** are instructions. When you ask for it, Claude may read public docs
  (core.telegram.org, docs.ton.org, the Acton docs) and write code in your project that calls the
  Telegram Bot API or the public TON Center API. Those requests come from your machine or your
  server, not from the plugin.
- **Requests Claude makes itself:** while working, Claude may open the public docs above, and
  `deploy-testnet` (and debugging with `telegram-ton`) asks the public TON Center testnet API about
  a contract or wallet address to confirm a transaction. Only public addresses are sent; no keys,
  tokens or personal data.
- **No transactions from Claude.** The plugin never sends a transaction or requests faucet funds:
  `deploy-testnet` prepares and emulates the deployment, gives you the exact command to run in
  your own terminal, then checks the result on chain. A hook blocks `acton script --net` and
  `acton wallet airdrop` if Claude tries anyway.
- No telemetry, no MCP servers, no bundled wallets. Details: PRIVACY.md.

## Requirements

- Claude Code for commands, agents and hooks; skills also work in other Claude surfaces.
- Node.js 22+ for the hooks.
- For contracts: [Acton](https://ton-blockchain.github.io/acton/docs/installation) 1.2.0+.
  **On Windows, Acton runs only inside WSL (Ubuntu 22.04+).** Everything else works without
  Acton; the build hook is skipped silently.

## Installation

```bash
/plugin marketplace add daniilganiev/telegram-dev
/plugin install telegram-dev@telegram-dev-marketplace
```

For plugin development:

```bash
claude --plugin-dir ./telegram-dev
claude plugin validate .claude-plugin/plugin.json --strict
```

## Does it help?

The author tested the plugin on trap tasks, solving each one with and without the plugin.
Version 0.3.0 (6 traps, one run per side): **0.94 with the plugin vs 0.34 without**. The gain is
where fresh facts and platform rules matter: Stars instead of crypto for digital goods, jetton
deposits, current Tolk syntax, Bot API changes of 2026 (ephemeral messages, `correct_option_ids`,
`sendMessageDraft`). On topics Claude already knows well there was no difference, so the skills
stay short there.

## Safety

- TON defaults to testnet; mainnet is blocked by a hook.
- Seed phrases, private keys and bot tokens never go into the chat, logs or the repo.
- Hooks are a safety net, not a replacement for review: they catch common mistakes, not every
  workaround.

## Sources

Where the facts come from and what was checked against primary sources: [SOURCES.md](SOURCES.md).

## License

MIT
