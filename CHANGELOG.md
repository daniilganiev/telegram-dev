# Changelog

## 0.3.1 — 2026-11-15
- Removed hooks and the Node scripts in `scripts/` (directory rules). Their checks are now rules
  in the skills: no secrets in source or commands, no reading `.env`/`wallets.toml`, no
  transactions or faucet requests from Claude, `acton build` after `.tolk` edits.
- Removed `.gitattributes`.
- Bot API 10.4: new `telegram-ton/references/widgets.md` (HTML widgets with Telegram's TON wallet,
  blocked for general bots in production since 13 November 2026; the Stars rule still applies),
  10.4 changes in `telegram-bot` (ephemeral replies to callbacks in any chat, other additions).
- TON Connect UI 3.1 / 5.0: typed errors and `error.name` in the troubleshooting reference.
- Safety rules also in the skill descriptions (always in context) and in the three agents;
  `telegram-bot` explains how to debug token errors without opening `.env`.
- README: eval numbers from the run with the same environment for both sides (1.00 vs 0.70).

## 0.3.0 — 2026-10-07
- Renamed to `telegram-dev`: Telegram first, TON only where it meets Telegram.
- Removed the bundled `@ton/mcp` server, the `toncenter_api_key` setting and the MCP send
  guard. Chain reading now goes through the public TON Center API (`chain-reading.md`).
- Skills regrouped: `telegram-dev` (was `ton-product-builder`), `telegram-payments` (was
  `telegram-stars-payments`), `telegram-ton` (merges `ton-payments`, `ton-tokens-nft`,
  `ton-chain-inspector`, `tolk-contracts` as references), new `telegram-launch`.
- Python alongside TypeScript: aiogram in `telegram-bot` and `telegram-payments`, Python
  `initData` validation, `new-bot` takes `ts` or `py`.
- Bot API 9.4–10.3 changes: bot-to-bot visibility, `sendMessageDraft` lifetime, ephemeral
  messages in their 10.3 shape, `correct_option_ids`, managed bots, guest mode, Business bots
  without Premium, subscription updates, paid media up to 25000 Stars, Mini App cross-origin
  restriction.
- New commands `add-payments` and `add-ton-connect`; `new-mini-app` works with or without TON.
- `payments-reviewer` became `telegram-security-reviewer` and also covers the bot and Mini App.
- `initData` reference fixed: `signature` stays in the HMAC data-check-string; byte-order sort.
- Evals and hook tests moved out of the published plugin (kept by the author).
- Privacy policy (PRIVACY.md).
- Claude never sends transactions: the hook blocks `acton script --net` (testnet and mainnet),
  mainnet commands and faucet requests; `deploy-testnet` hands the broadcast command to the user.
- README examples, SECURITY.md.
- Acton flows checked on Acton 1.2.1 in WSL: deploy script path is `contracts/scripts/deploy.tolk`
  (was `scripts/deploy.tolk`); `after-tolk-edit` now runs `acton build` through WSL on Windows.

## 0.2.0 — 2026-10-07
- New skills: `telegram-bot`, `telegram-stars-payments`, `ton-payments`, `ton-tokens-nft`,
  `ton-chain-inspector`.
- New commands: `new-bot`, `audit-project`.
- New agents: `payments-reviewer`, `tolk-test-writer`.
- New references: `ton_proof` auth, Mini App platform notes, Acton cheatsheet, test recipes.
- Hooks: block secret-printing commands and secret writes into source files; always ask
  before broadcasting transactions or touching wallet keys through the MCP server.
- TON Center key is now a plugin setting (`toncenter_api_key`, stored securely) instead of
  being read from the user's environment.
- Hook tests.
- Content re-checked against the original docs (TON, Acton, Telegram) instead of summaries:
  `ton_proof` verification details, jetton and Gram payment processing, finality model, real
  Tolk syntax and version notes, official TON security guide, TON Connect troubleshooting,
  Bot API limits.
- Stars rule made explicit: digital goods inside Telegram must use Stars; crypto is not allowed
  for them. `ton-payments` is scoped accordingly.
- Acton notes: native Windows unsupported (WSL only); `acton verify` is testnet-only.
- MCP server isolated: wallet registry moved to the plugin data folder and `MNEMONIC` /
  `PRIVATE_KEY` blanked so keys are never inherited from the shell.
- `SOURCES.md` added.

## 0.1.0 — 2026-09-28
- Initial release: orchestrator, Tolk/Acton and Mini App skills, `deploy-testnet` and
  `new-mini-app` commands, security reviewer agent, mainnet/secret guard hooks,
  official `@ton/mcp` pinned to 0.1.15-alpha.23 on testnet.
