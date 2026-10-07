# Privacy policy

Last updated: 7 October 2026.

Telegram Dev is a plugin made of instructions (skills, commands, agents) and local hook scripts.

- **No data collection.** The plugin has no server, no analytics and no telemetry. It doesn't
  collect, store or send any personal data, code or usage information.
- **Hooks run locally.** The scripts in `scripts/` read the tool call Claude is about to make
  (a command or a file write), decide whether to block it, and exit. They make no network
  requests and write nothing to disk. `after-tolk-edit` runs `acton build` in your project if
  Acton is installed (on Windows, through WSL).
- **No MCP servers and no wallets.** The plugin doesn't hold keys, seed phrases or bot tokens.
  The only transaction it can lead to is a testnet deployment in `deploy-testnet`, signed by Acton
  with your own local testnet wallet after you confirm it. Mainnet is never sent from Claude.
- **Third-party services.** When you ask for it, Claude may read public documentation (Telegram,
  TON, Acton), query the public TON Center testnet API about a public contract or wallet address,
  or write code in your project that calls the Telegram Bot API or TON Center. Those requests go
  directly from your environment to those services under their own privacy policies; no keys,
  tokens or personal data are sent by the plugin.

Questions: open an issue at https://github.com/daniilganiev/telegram-dev/issues.
