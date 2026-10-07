# Changelog

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
- Evals for the 2026 Bot API traps: `ai-stream-draft`, `ephemeral-group`, `quiz-poll`.
- Plugin icon (`assets/icon.png`) and `PRIVACY.md`.

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
- Hook tests in `test/hooks.test.mjs`.
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
