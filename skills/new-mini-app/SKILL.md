---
description: Scaffold a Telegram Mini App with a backend that validates initData, optionally with a TON contract and TON Connect via Acton. Pass the project name and optionally "ton".
argument-hint: <name> [ton]
disable-model-invocation: true
---

# New Telegram Mini App

Arguments: `$ARGUMENTS`. The first word is the project name (ask if missing). Add `ton` when the
app needs a TON contract.

1. Ask one question: what the app does in one sentence. Use the `telegram-dev` skill to decide
   surfaces, payment method and the on-chain split; write `PRODUCT.md`.
2. **Without `ton`:** start from an official Telegram Mini Apps template on `@tma.js/sdk` (check
   the current list in its docs) and add a small backend in the user's language with the
   `initData` validation from `telegram-mini-app/references/init-data-validation.md`.
3. **With `ton`:** check `acton --version` (1.2.0+) and `node --version` (22.12+). On Windows Acton
   needs WSL; if it is missing, say so and stop rather than installing system tools. Then
   `acton new <name> --template counter --app`, `acton build`, `acton test`, `npm ci`.
4. Add the Telegram layer: SDK init, theme variables, safe areas, back button, and a visible
   "TESTNET" badge when a wallet is involved.
5. Wire the front end to the backend: send raw `initData` with each request and reject anything
   that fails validation.
6. For `ton`, replace the counter contract step by step, keeping tests green after each step.
7. Finish with what the user does by hand: BotFather `/newapp` or menu button, HTTPS hosting or
   a tunnel, TON Center testnet key if a wallet is used, testnet coins from a faucet.
