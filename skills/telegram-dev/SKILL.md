---
name: telegram-dev
description: Plan and build a product in Telegram from idea to launch — pick between a bot, a Mini App, a channel automation or a combination, choose how to charge (Stars, card providers or TON), decide what if anything goes on the TON blockchain, and hand off to the right skill. Use this skill whenever the user wants to build, plan or scaffold something in Telegram, even vaguely, such as "a Telegram game with rewards", "a shop in Telegram", "a paid channel", "an AI assistant bot", "token-gated chat", "NFT drop for my community" or "monetize my bot".
---

# Building a Telegram product

This skill decides the shape of the product and routes to the specialised skills:

| Skill | Area |
|---|---|
| `telegram-bot` | bots in TS or Python, webhooks, automation, AI bots, Business and managed bots, limits |
| `telegram-mini-app` | apps inside Telegram, SDK, `initData` validation |
| `telegram-payments` | Stars, subscriptions, paid media, gifts, card providers |
| `telegram-ton` | wallets, TON payments, jettons, NFTs, Tolk contracts |
| `telegram-launch` | release checklist, monitoring, monetization |

Commands the user can run: `new-bot`, `new-mini-app`, `add-payments`, `add-ton-connect`,
`audit-project`, `deploy-testnet`. Agents: `telegram-security-reviewer`,
`ton-security-reviewer`, `tolk-test-writer`.

## Step 1. Pin down the product

Ask only what isn't clear yet:

1. What does the user do in Telegram: chat with a bot, open an app, read a channel, all of these?
2. Who pays, for what, and is it digital or physical?
3. Does anything really need a blockchain? Be sceptical. Profiles, leaderboards, points and
   content are cheaper and safer off-chain. On-chain is for assets users own and can take
   elsewhere, wallet login, or value transfer between users.
4. Language of the backend: TypeScript or Python.

Write the answers into a short `PRODUCT.md`: user flow, surfaces, payment method and why,
on-chain vs off-chain split, admin model.

## Step 2. Choose surfaces

| Need | Use |
|---|---|
| Commands, notifications, support, AI chat | bot |
| Rich UI, games, catalogs, dashboards | Mini App opened from the bot |
| Content on a schedule | channel + bot as admin + your own scheduler |
| Acting for a business account | Business bot |
| Users creating their own bots through yours | managed bots |

## Step 3. Choose how to charge

Digital goods and services inside Telegram are paid **only in Stars**; crypto is not allowed for
them. This single rule changes many product ideas, so settle it before any code. Physical goods:
a card provider. TON fits payouts, deposits, assets the user owns and wallet-based features. Details
in `telegram-payments` and `telegram-ton`.

## Step 4. Build in this order

1. Backend skeleton and bot (`/telegram-dev:new-bot`) or Mini App (`/telegram-dev:new-mini-app`).
2. `initData` validation and auth before any feature that touches user data.
3. Core features, with tests for the unhappy paths.
4. Payments (`/telegram-dev:add-payments`): order on the server, fulfil only after a verified
   payment, idempotent.
5. Wallet and chain parts if needed (`/telegram-dev:add-ton-connect`), contracts last and only if
   a plain transfer can't do the job.
6. Telegram test environment and TON testnet run-through.
7. `/telegram-dev:audit-project`, then the `telegram-launch` checklist.

## Safety defaults

- Secrets (bot token, API keys, seed phrases, private keys) never go into the repo, the front
  end, logs or the chat. This plugin's hooks block the common mistakes.
- TON work defaults to testnet. Mainnet commands are blocked by the plugin's hook; the user runs
  them in their own terminal.
- Anything that moves money is signed by the user in their own wallet, never by Claude.
