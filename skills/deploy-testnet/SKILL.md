---
description: Prepare and check a TON testnet deployment of the current Acton project — build, tests and local emulation, then the user broadcasts with the exact command given, then an on-chain check. Pass the script path as an argument (defaults to contracts/scripts/deploy.tolk).
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
   `acton wallet list` must show that name. If it doesn't, give the user the commands to run
   in their own terminal: `acton wallet new --name deployer --version v5r1 --local` (add
   `--secure false` in WSL, where there is no native key store and the command waits forever)
   and `acton wallet airdrop deployer` for free testnet GRAM, or suggest `--tonconnect`. The
   user runs them, so the mnemonic never enters the chat. Never ask for, import or handle a
   mnemonic: the same phrase controls the mainnet wallet too.
4. **API key.** Recommend a TON Center key in the project's `.env` to avoid 429 errors.
5. **Hand over the broadcast.** Claude never sends transactions. Summarise network = testnet,
   script, wallet and value attached, then give the exact command for the user to run in their
   own terminal: `acton script <script> --net testnet` (add `--tonconnect` if chosen). Wait for
   them to report back.
6. **Verify on chain.** Query the testnet TON Center API (`telegram-ton/references/chain-reading.md`):
   the contract's transactions and trace, to confirm it is active and the deploy succeeded.
7. **Report.** Give the user the contract address, a testnet explorer link, and next
   steps (wire the address into the Mini App config, run the security review).

Never run `acton script` with `--net` from this skill; the plugin's hook blocks it anyway.
