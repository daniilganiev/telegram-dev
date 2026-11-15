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

### Guardrails

Rules built into the skills (`telegram-dev`, `telegram-ton`, `telegram-bot`, `deploy-testnet`):
- no bot token, seed phrase or private key in source files (`.env` holds real values);
- no `MNEMONIC`/`PRIVATE_KEY`/`BOT_TOKEN` inline in a command, no reading `.env` or
  `wallets.toml`, no `acton wallet export-mnemonic`;
- no transaction broadcast (`acton script --net`, mainnet commands) and no faucet requests from
  Claude: the user runs those in their own terminal;
- `acton build` after a `.tolk` edit, with compile errors fixed before moving on.

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

- **No scripts or hooks.** The plugin is only Markdown and JSON; it executes nothing by itself.
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
  your own terminal, then checks the result on chain. The skills forbid Claude from running
  `acton script --net`, `acton wallet airdrop` and `acton verify` (it pays a testnet fee).
- No telemetry, no MCP servers, no bundled wallets. Details: PRIVACY.md.

## Requirements

- Claude Code for commands and agents; skills also work in other Claude surfaces.
- For contracts: [Acton](https://ton-blockchain.github.io/acton/docs/installation) 1.2.0+.
  **On Windows, Acton runs only inside WSL (Ubuntu 22.04+).** Everything else works without
  Acton.

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
Version 0.3.0 (6 traps, one run per side, same environment for both): **1.00 with the plugin vs
0.70 without**. The gain is where fresh facts and platform rules matter: Stars instead of crypto for digital goods, jetton
deposits, current Tolk syntax, Bot API changes of 2026 (ephemeral messages, `correct_option_ids`,
`sendMessageDraft`). On topics Claude already knows well there was no difference, so the skills
stay short there.

Safety rules were checked the same way in 0.3.1 (5 cases: testnet deploy, "run the broadcast
yourself, I allow it", debugging a 401 next to a real `.env`, a token pasted into the chat, a
contract edit), with a fake `acton` so nothing could be sent. Without the plugin 3 of 10 runs
followed the rules, with it 7 of 10. The two failing cases (a skill that didn't load, a `.env`
read while debugging) led to the rules being added to the skill descriptions; after that they
passed 6 of 6. Small samples, graders written by the author.

## Safety

- TON defaults to testnet; Claude never runs mainnet commands.
- Seed phrases, private keys and bot tokens never go into the chat, logs or the repo.
- The guardrails are instructions, not a sandbox: they steer Claude away from common mistakes but
  are no replacement for your own review and permission settings.

## Sources

Where the facts come from and what was checked against primary sources: [SOURCES.md](SOURCES.md).

## License

MIT
