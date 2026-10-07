---
description: Scaffold a Telegram bot backend in TypeScript (grammY) or Python (aiogram), webhook-ready, with optional Mini App button and Stars payments. Arguments are the project name and optionally ts or py.
argument-hint: <name> [ts|py]
disable-model-invocation: true
---

# New Telegram bot

Arguments: `$ARGUMENTS`. The first word is the project name (kebab-case; ask if missing). The
second is the language: `ts` (grammY, default) or `py` (aiogram 3). If the current folder
already has `package.json` or `pyproject.toml`, follow it instead.

1. Check the runtime: `node --version` (22+) for `ts`, `python --version` (3.10+) for `py`.
   Ask only two things: what the bot does in one sentence, and whether it opens a Mini App
   and/or takes payments.
2. Create the project from the framework's current docs, not from memory.
   - `ts`: `src/bot.ts` (handlers), `src/server.ts` (webhook with secret-token check),
     `src/dev.ts` (long polling for local runs), strict `tsconfig`.
   - `py`: `app/bot.py` (routers), `app/server.py` (aiohttp or FastAPI webhook with
     secret-token check), `app/dev.py` (polling), `pyproject.toml`, virtual env instructions.
3. `.gitignore` with `.env`, `node_modules`, `.venv`, `__pycache__`; `.env.example` with
   `BOT_TOKEN=`, `WEBHOOK_SECRET=`, `WEBAPP_URL=`.
4. `/start` that handles missing and unknown parameters, `/help`, and, if requested, a button
   that opens the Mini App via `web_app`.
5. Payments requested: add the Stars handlers from `telegram-payments` with idempotent fulfilment.
6. Run the typecheck (`tsc --noEmit`) or `python -m compileall` plus a linter if present. Start it
   only if the user has put their own token in `.env`; never ask for the token in chat.
7. Finish with what the user does by hand: `/newbot` in @BotFather, token into `.env`, choose
   hosting, `setWebhook` with the secret, commands, menu button.
