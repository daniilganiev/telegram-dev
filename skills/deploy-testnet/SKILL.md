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
3. **Wallet check.** Ask the user which testnet wallet to use, or whether to use
   `--tonconnect`. Never ask for or handle a mnemonic in chat. If they need testnet
   coins, tell them to use an official testnet faucet.
4. **API key.** Recommend a TON Center key in the project's `.env` to avoid 429 errors.
5. **Confirm.** Summarise: network = testnet, script, wallet, value attached. Wait for
   an explicit "yes".
6. **Broadcast.** Run `acton script <script> --net testnet` (add `--tonconnect` if chosen).
7. **Verify on chain.** Query the testnet TON Center API (`telegram-ton/references/chain-reading.md`):
   the contract's transactions and trace, to confirm it is active and the deploy succeeded.
8. **Report.** Give the user the contract address, a testnet explorer link, and next
   steps (wire the address into the Mini App config, run the security review).

Never run with `--net mainnet` from this skill.
