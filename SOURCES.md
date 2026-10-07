# Sources

Where the facts in the plugin's skills come from. Checked in October 2026. Things change fast, so
the skills always point to the primary source. The plugin's rule: **documentation and source code
beat channels and chats**. Channels give news and context; only what the documentation confirms
goes into code and checklists.

## Channels and chats

| Source | What was taken | Reliability |
|---|---|---|
| [@anatolii_makosov](https://t.me/anatolii_makosov) | Network timeline (sub-second blocks, lower fees, collators), `confirmed` and `finalized` statuses, Streaming API v2, Jetton-2.1-tolk on minter.ton.org, spam NFTs after the fee drop, experimental Rust node, Tolk 1.3/1.4 and Acton | Author from the TON ecosystem; news and context |
| [@tolk_lang](https://t.me/tolk_lang) | Tolk version history (0.7 → 1.5), breaking changes (`address` is internal-only since 1.2, `ton()` → `grams()`, `bytesN` → `bitsN`), Acton, Actonscan, TON Verifier | The language's channel; versions checked against the changelog in the docs |
| [@toncenter_news](https://t.me/toncenter_news) | Migration from API v1 to `/api/v3`, Streaming API, decoded message bodies, `is_scam` and `is_nsfw` fields, opt-in display of tokens | TON Center's channel |
| [github.com/ton-blockchain](https://github.com/ton-blockchain) | Repositories `ton`, `acton`, `docs`, `TEPs`, `tg-wallet-contract`, `bug-bounty`; official agent skills | Primary source |
| [ton-blockchain/ton#2575](https://github.com/ton-blockchain/ton/pull/2575) | QUIC instead of RLDP2 in public overlays, node 3.3+ required | Concerns node operators, not app developers |
| [@tondev](https://t.me/tondev) (chat export) | Recurring developer problems: address formats, exit codes, bounces, sending to an undeployed wallet, Highload wallets, API limits, scams. Only what the docs confirm was used | Opinions and AI-bot answers, partly outdated or wrong; the export itself is not published (personal data) |
| [gramnews.org: ecosystem map Q3 2026](https://gramnews.org/ru/articles/ton-ecosystem-map-q3-2026) | Market context: 373 projects, 27 categories, many tap-to-earn bots. Not used in code or checklists | Media, figures not verified |

## Documentation (primary sources)

- TON: https://docs.ton.org (Tolk, TON Connect and `ton_proof`, Gram and jetton payments,
  Streaming API and API v2/v3, TON Center limits, jetton and NFT standards, contract security,
  TVM exit codes, address formats). Pages are available as markdown at
  `https://docs.ton.org/llms/<section>/content.md`; index: https://docs.ton.org/llms.txt
- Acton: https://ton-blockchain.github.io/acton/docs (commands, tests, wallets, deployment,
  verification, installation and WSL); index: https://ton-blockchain.github.io/acton/llms.txt
- Telegram: https://core.telegram.org/bots, `/bots/features`, `/bots/faq`, `/bots/api`,
  `/bots/api-changelog`, `/bots/webapps`, `/bots/payments-stars`, `/bots/payments`
- Telegram clients: https://telegram.org/apps (for the Mini App test matrix)
- TON Center API v3 (hosts, per-network keys, pagination, error codes):
  https://docs.ton.org/api/v3/overview
- Official TON skills for deep contract work: https://github.com/ton-blockchain/skills
- Publishing a plugin: https://claude.com/docs/directory/publish,
  https://claude.com/docs/plugins/pre-submission-checklist,
  https://code.claude.com/docs/en/plugins/manifest-reference
- Background: https://claude.com/blog/build-plugins-for-claude

## Checked against primary sources and changed the plugin

- Digital goods inside Telegram: **Stars only**, crypto is not allowed (Telegram, `payments-stars`).
- `ton_proof`: payload length limits, mandatory network check, one-time nonce.
- Payments: allowlist of jetton masters, `forward_ton_amount` of at least 1 nano unit, message
  lookup by BOC for UX only, the Streaming API doesn't replay missed events.
- Tolk: real syntax (`struct (0x…)`, `else =>`, `BounceMode`, `grams()`).
- Acton: **native Windows is not supported (WSL only)**; `acton verify` works on testnet only and
  charges for verification.
- `@ton/mcp` defaults to mainnet and keeps wallets in an obfuscated registry; since 0.3.0 the
  plugin doesn't ship it and reads the chain through the public TON Center API instead.
- Bot API limits and paid broadcasts (Telegram FAQ).
- `initData`: for the HMAC check only `hash` is removed and `signature` stays in the string; for
  verification without the token the string starts with `<bot_id>:WebAppData` and excludes both
  `hash` and `signature` (`/bots/webapps`).
- Bot API 9.4–10.3 (2026): bots see some messages from other bots in groups (10.0),
  `sendMessageDraft` lives about 30 seconds and needs a final `sendMessage`, ephemeral messages
  moved to `ephemeral_message_parameters` (10.3), `correct_option_ids` in polls and
  `allows_multiple_answers` for quizzes (9.6), managed bots (9.6), guest mode (10.0), Mini App
  cross-origin calls blocked since 20 July 2026 (10.2), `subscription` updates (10.2), paid media up
  to 25000 Stars.
