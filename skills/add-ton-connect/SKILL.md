---
description: Add TON Connect to an existing Telegram Mini App — manifest, connect button, wallet login with ton_proof verified on the backend, and binding the wallet to the Telegram user. Testnet by default.
disable-model-invocation: true
---

# Add TON Connect

1. Read the project: front-end framework, backend language, how `initData` is validated today.
   If it isn't validated on the server yet, fix that first (`telegram-mini-app`).
2. Ask why the wallet is needed (login, payouts, owning NFTs or tokens, deposits). If the answer
   is "to pay for in-app items", stop and explain the Stars rule (`telegram-payments`).
3. Front end: the current TON Connect SDK for the framework (AppKit or `@tonconnect/ui-react`;
   check the docs), a public `tonconnect-manifest.json` over HTTPS, `twaReturnUrl` set to the
   bot or app link, a network badge.
4. Backend, following `telegram-ton/references/ton-proof-auth.md`:
   - an endpoint that issues a one-time nonce with a short expiry, tied to the Telegram user;
   - verification of the proof: domain, timestamp, network, public key from `walletStateInit`,
     address match, nonce used once;
   - store the binding Telegram user id ↔ wallet address only after both `initData` and the
     proof pass.
5. Tests for: reused nonce, wrong domain, expired proof, testnet proof on a mainnet config,
   address mismatch.
6. Report what the user does by hand: host the manifest and icon, TON Center testnet key in the
   backend env, a testnet wallet for manual testing.
