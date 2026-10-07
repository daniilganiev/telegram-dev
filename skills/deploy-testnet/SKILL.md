---
description: Safely deploy the current Acton project's contract to TON testnet — local emulation first, then testnet broadcast, then on-chain check. Pass the script path as an argument (defaults to contracts/scripts/deploy.tolk).
disable-model-invocation: true
---

# Deploy to TON testnet

Script to deploy: `$ARGUMENTS` (if empty, use `contracts/scripts/deploy.tolk`, where Acton templates put it; if it is missing, list `*.tolk` files under a `scripts` folder and ask).

Follow these steps in order and stop at the first failure, explaining it to the user.

1. **Preflight.** Confirm this is an Acton project (`Acton.toml` exists); on Windows, that
   commands run inside WSL. Run
   `acton build` and `acton test`. Do not continue if tests fail.
2. **Local emulation.** Run `acton script <script>` without `--net`. Check that the
   printed address, initial state and post-deploy getters look right.
3. **Wallet check.** The script names its wallet (for example `scripts.wallet("deployer")`);
   `acton wallet list` must show that name. If it doesn't, offer `--tonconnect` or a fresh
   testnet wallet: `acton wallet new --name deployer --version v5r1 --local` (add
   `--secure false` in WSL, where there is no native key store and the command waits forever),
   then `acton wallet airdrop deployer` for free testnet GRAM. Never ask for, import or
   handle a mnemonic from the chat: the same phrase controls the mainnet wallet too.
4. **API key.** Recommend a TON Center key in the project's `.env` to avoid 429 errors.
5. **Confirm.** Summarise: network = testnet, script, wallet, value attached. Wait for
   an explicit "yes".
6. **Broadcast.** Run `acton script <script> --net testnet` (add `--tonconnect` if chosen).
7. **Verify on chain.** Query the testnet TON Center API (`telegram-ton/references/chain-reading.md`):
   the contract's transactions and trace, to confirm it is active and the deploy succeeded.
8. **Report.** Give the user the contract address, a testnet explorer link, and next
   steps (wire the address into the Mini App config, run the security review).

Never run with `--net mainnet` from this skill.
