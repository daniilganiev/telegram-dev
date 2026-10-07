---
description: Pre-release audit of a Telegram bot or Mini App, with or without TON — secrets scan, typecheck, lint and tests, Telegram-specific checks, then the security reviewer agents. Run before a release or any mainnet discussion.
disable-model-invocation: true
---

# Audit project

Work through these in order and report each result. Don't fix anything silently; list findings
and ask before changing code.

1. **Secrets scan.** Search tracked files (not git-ignored ones such as `.env`) for bot tokens
   (`\d{8,10}:[A-Za-z0-9_-]{35}`), seed phrases, 64-hex private keys, API keys, and for `.env` or
   `wallets.toml` tracked by git (`git ls-files`). Check the built front-end bundle too. Report
   file and line; never print the secret value.
2. **Build and tests.** Run the project's typecheck, lint and tests (`package.json` scripts, or
   `pyproject.toml` tooling such as ruff, mypy and pytest).
3. **Telegram checks.** `initData` validated on the server with an `auth_date` limit; webhook
   checks its secret token; `allowed_updates` matches the handlers; handlers idempotent; 429 and
   403 handled in broadcasts.
4. **Payments (if present).** Delegate to the `telegram-security-reviewer` agent.
5. **Contracts (if `Acton.toml` exists).** `acton build`, `acton check`, `acton test --coverage`
   (WSL on Windows). Then delegate to the `ton-security-reviewer` agent.
6. **Summary.** One table: area, status (passed, failed or skipped), top finding. Then go through the
   `telegram-launch` checklist for what automation can't check. End with a verdict: ready for
   release, ready for a human audit, or not ready. Never call anything "safe for mainnet".
