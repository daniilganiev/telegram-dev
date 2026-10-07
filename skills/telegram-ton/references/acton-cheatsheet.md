# Acton cheatsheet

Source: https://ton-blockchain.github.io/acton/docs/commands/overview. Flags change; confirm
with `acton help <command>` before relying on any of them. `acton doctor` diagnoses a broken
environment.

## Platform and install

Acton ships as one dependency-free binary for macOS (ARM64, x86_64) and Linux (x86_64, ARM64;
Ubuntu 22.04+ baseline). **Native Windows is not supported: install and run Acton inside WSL
(Ubuntu 22.04+)**, and run Git in the same WSL distribution. Installer:
`curl -LsSf https://github.com/ton-blockchain/acton/releases/latest/download/acton-installer.sh | sh`,
then `acton --version`. WSL, `trunk` and source builds are best-effort.

Official agent skills (`acton`, `tolk`, `func2tolk`, `ton-blockchain`) live in
https://github.com/ton-blockchain/skills; install with
`npx skills add https://github.com/ton-blockchain/skills` (add `-g` for global). This plugin
doesn't duplicate them; install them for deeper Acton and Tolk guidance.

## Commands

| Command | Use |
|---|---|
| `acton new <name> --template <t> [--app] [--hooks] [--agents]` | New project. Templates: `empty`, `counter`, `jetton`, `nft`, `w5-extension`. `--app` adds a React + Vite front end in `app/` and TypeScript wrappers in `wrappers-ts/` |
| `acton init` | Add an Acton scaffold to an existing directory |
| `acton build` | Compile contracts and emit artifacts |
| `acton test` | Run `*.test.tolk` tests |
| `acton check` | Lint Tolk |
| `acton fmt` | Format `.tolk` files |
| `acton script <file> [--net testnet\|mainnet] [--tonconnect]` | Run a Tolk script. No `--net` means local emulation |
| `acton run` | Run script entries declared in `Acton.toml` |
| `acton wallet` | `new`, `import`, `list --balance`, `airdrop <name> --net testnet`, `remove`, `sign`, `export-mnemonic` (never run by the assistant) |
| `acton verify [name] [--address A] [--wallet W \| --tonconnect] [--dry-run]` | Ticket-based source verification against the TON verifier on **testnet**. It sends a testnet payment and uploads the sources; `--dry-run` prepares without paying |
| `acton wrapper` | Generate Tolk or TypeScript wrappers from the ABI |
| `acton rpc` | Query accounts and decode storage |
| `acton retrace` | Replay an on-chain transaction locally |
| `acton disasm`, `acton doc` | Disassemble bytecode; look up TVM instructions and ABIs |
| `acton library` | Publish and fetch on-chain libraries |
| `acton func2tolk` | Translate FunC to Tolk (migration) |
| `acton localnet`, `acton simulator` | Local network (Docker) and lightweight forks |
| `acton studio` | Browser workspace for tests and wallets |
| `acton up` | List, inspect and install Acton releases |

## `acton test` flags worth knowing

`-f, --filter <regex>`, `--fail-fast`, `--coverage`, `--coverage-format lcov|text`,
`--coverage-minimum-percent <n>` (CI gate), `--snapshot <path>` and `--baseline-snapshot <path>`
(gas regression), `--gas-profile <path>`, `--mutate` (mutation testing; `--mutate-contract`,
`--mutation-levels critical|major|minor`), `--fork-net <network>` (test against real chain
state), `--ui` (browser inspector), `--show-bodies`, `--save-test-trace`, `--reporter
console|junit|...`.

## Wallets and secrets

Wallets live in `wallets.toml` (project, git-ignored) or a global file; local entries override
global ones. Mnemonic sources, best first: system keyring (`mnemonic-keyring`), environment
variable (`mnemonic-env`), a file outside git (`mnemonic-file`), plain text (development only).
Use testnet wallets for experiments and `acton wallet airdrop` for test coins. Acton loads `.env`
automatically and reads `TONCENTER_TESTNET_API_KEY` and `TONCENTER_MAINNET_API_KEY` (one key per
network) to avoid rate limits. `acton wallet export-mnemonic` prints the seed phrase, so the
assistant must never run it.

## Deploy script shape

There is no `acton deploy`; a script deploys. Local first, then testnet:

```bash
acton script contracts/scripts/deploy.tolk
acton script contracts/scripts/deploy.tolk --net testnet
```

Script outline (from the Acton docs; copy the project's generated script instead of
retyping it): select a wallet with a prompt, build the contract from its initial storage,
call `deploy` with an attached value in `grams(...)`, wait for the trace, fail loudly if it
did not succeed, print the address.

## Language notes

See `tolk-essentials.md` for the language version history (v1.5 at the time of writing).
FunC is legacy; migrate with `acton func2tolk` only with the user's agreement. Syntax
highlighting for Tolk is available on GitHub. Related tools from the Tolk/Acton team: Actonscan
(an ABI-aware explorer), Acton Studio (simulator and localnet) and https://verifier.ton.org
(links deployed code to source by code hash).
