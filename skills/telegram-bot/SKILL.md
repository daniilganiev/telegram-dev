---
name: telegram-bot
description: Build, host and automate Telegram bots in TypeScript (grammY) or Python (aiogram, python-telegram-bot) — BotFather setup, webhooks vs long polling, commands, deep links, keyboards, groups and channels, broadcasts and rate limits, AI bots that stream replies, Business bots, managed bots, guest mode, ephemeral messages and launching a Mini App. Use this skill whenever the user creates or edits a Telegram bot, asks about BotFather, a bot token, webhooks, getUpdates, bot commands, start parameters, mass messaging, posting to a channel on a schedule, a support or AI chat bot, or hosting a bot on Vercel, a VPS or another serverless platform.
---

# Telegram bot

The Bot API changes every month or two (10.3 in August 2026). Before using any method or field
you are not sure about, check https://core.telegram.org/bots/api-changelog. Frameworks lag behind
the API; when a framework has no wrapper yet, call the method directly (`bot.api.raw.<method>`
in grammY, or a plain POST to `https://api.telegram.org/bot<token>/<method>`) instead of
inventing a wrapper that doesn't exist.

## Stack

| Language | Default | Notes |
|---|---|---|
| TypeScript | grammY | Node, Deno, Bun, edge; webhook adapters for most hosts |
| Python | aiogram 3 | async, routers, FSM; `python-telegram-bot` if the project already uses it |

Use what the project already has. Look up current setup in the framework docs rather than
writing boilerplate from memory.

## Setup

1. `@BotFather` → `/newbot`. The token goes into a backend env var (`BOT_TOKEN`), never into
   the repo, the Mini App bundle or a chat message. A leaked token is revoked in @BotFather.
2. Commands via `setMyCommands` (up to 32 chars: Latin letters, digits, underscores). Scope
   them per chat type and language if needed.
3. Mini App entry points: menu button, an inline button with `web_app`, a direct link
   `https://t.me/<bot>/<app>?startapp=<param>` or the main Mini App `https://t.me/<bot>?startapp`.

## Webhook or long polling

- Local development: long polling. Production and serverless: webhook over HTTPS on port 443,
  80, 88 or 8443.
- `setWebhook` with a `secret_token` (1-256 chars of `A-Za-z0-9_-`); reject every request whose
  `X-Telegram-Bot-Api-Secret-Token` header doesn't match. Set `allowed_updates` to what the bot
  handles; add `pre_checkout_query` for payments and anything new you rely on, because some
  update types are not delivered unless listed.
- Acknowledge fast. On serverless, do slow work after replying or in a queue; Telegram retries
  when the webhook times out, which produces duplicates.
- Make handlers idempotent: key on `update_id` or on the business object (order id, charge id).
- `getUpdates` doesn't work while a webhook is set. It returns the earliest 100 unconfirmed
  updates; confirm with `offset = last update_id + 1`.

## Deep links and state

`https://t.me/<bot>?start=<value>`: up to 64 chars of `A-Za-z0-9_-`. Pass an opaque id and keep
state on the server; never put secrets or raw user ids in it. In Mini Apps the equivalent is
`startapp`, which arrives as `start_param`.

## Limits

Source: https://core.telegram.org/bots/faq (Telegram says the values may change).

- One chat: about 1 message per second (short bursts, then 429). A group: 20 per minute.
  Bulk: about 30 messages per second overall.
- Paid broadcasts (`allow_paid_broadcast`) go up to 1000 per second at 0.1 Stars per message
  above the free 30, from the bot's Stars balance. The FAQ and the API reference give different
  minimum balances; read the current text before promising numbers.
- On 429, wait `retry_after`. For broadcasts use a queue plus grammY `auto-retry` / throttler, or
  an aiogram middleware with backoff. Mark users who blocked the bot (403) and stop sending.
- A bot can't start a conversation. The user must message it first or add it to a group.

## Changes that older answers get wrong

- **Bots and other bots.** Since Bot API 10.0 bots can see certain messages from other bots in
  groups, and bots can message each other by username when both enabled bot-to-bot
  communication. Don't assume bot messages are invisible; filter `from.is_bot` if you must
  ignore them. Group bots still default to privacy mode.
- **Streaming AI replies.** `sendMessageDraft` (all bots since 9.5) shows a draft that lives about
  30 seconds. Stream into it with the same non-zero `draft_id`, then send the final text with
  `sendMessage`, or the answer disappears. Empty text shows "Thinking…"; `can_stop` lets the user
  stop generation and you receive `stopped_message_generation`. Rich formatting:
  `sendRichMessage` / `sendRichMessageDraft` (10.1).
- **Ephemeral messages** (visible to one user in a group): introduced in 10.2 with
  `receiver_user_id` and `callback_query_id`; in **10.3 these were replaced** by
  `ephemeral_message_parameters`. Use the 10.3 shape.
- **Polls.** `correct_option_id` became `correct_option_ids` (9.6); quizzes may now have several
  correct answers and accept `allows_multiple_answers`. Options are `InputPollOption` objects.
- **Guest mode** (10.0): a bot can answer in chats it isn't a member of via
  `guest_message` updates and `answerGuestQuery`.
- **Managed bots** (9.6): a manager bot can create bots for users
  (`https://t.me/newbot/<manager>/<suggested_username>`), receive `managed_bot` updates and
  fetch or rotate their tokens with `getManagedBotToken` / `replaceManagedBotToken`. Treat those
  tokens like your own: encrypted at rest, never logged.
- **Business bots** (9.0+, no Premium needed since 10.0): act for a business account through
  `business_connection_id`; check `BusinessBotRights` before each action instead of assuming.
- Paid subscriptions now produce `subscription` updates (`BotSubscriptionUpdated`, 10.2).

## Automation

- **Posting to a channel:** add the bot as an admin with post rights; send to `@channelname`
  or the numeric id. Schedule with a cron on your side (Vercel Cron, a worker, APScheduler);
  the Bot API has no scheduled sending.
- **Suggested and paid posts** (9.2): paid posts must not be deleted for 24 hours or the payment
  is lost.
- **Userbots** (MTProto via Telethon, Pyrogram, GramJS) act as a real account. They break no
  Bot API rules but are easy to get banned for spam, need the user's phone login and session
  string (a full account credential). Prefer a bot; if the user insists, warn them and keep the
  session out of the repo.

## Payments and wallets

Stars and digital goods: `telegram-payments`. TON, wallets, jettons: `telegram-ton`. Never
fulfil an order from a client-side callback. To bind a bot user to a wallet, validate `initData`
in the Mini App and verify `ton_proof`; never trust a bare address.

## Before launch

- [ ] Token only in env; `.env` git-ignored; `.env.example` has placeholders.
- [ ] Webhook secret verified; `allowed_updates` set; handlers idempotent.
- [ ] Errors go to a log, not verbatim to users; `/start` handles missing and unknown params.
- [ ] Tested in a private chat, a group, and with a user who blocked the bot.
- [ ] Broadcasts throttled and resumable. See `telegram-launch` for the full checklist.
