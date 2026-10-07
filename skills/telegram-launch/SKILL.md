---
name: telegram-launch
description: Get a Telegram bot or Mini App ready for real users — release checklist for secrets, webhooks, payments, Mini App security and TON parts, hosting and monitoring, BotFather listing and profile, growth and monetization options and their rules. Use this skill whenever the user is about to launch, release or publish a bot or Mini App, asks "is it ready", "what am I missing", how to promote or monetize a bot, or wants a production checklist.
---

# Launching in Telegram

Go through the sections that apply, report each item as done, missing or not applicable, and
ask before changing code. For an automated pass run `/telegram-dev:audit-project`.

## Secrets and access

- [ ] Bot token, API keys and webhook secret only in the host's env vars; `.env` git-ignored;
      `.env.example` with placeholders.
- [ ] Nothing secret in the Mini App bundle (search the built files, not only the source).
- [ ] The Telegram account that owns the bot has 2-step verification.
- [ ] A plan for a leaked token: revoke in @BotFather, update env, redeploy.

## Bot

- [ ] Webhook with `secret_token`, checked on every request; `allowed_updates` lists every
      update type the code handles.
- [ ] Handlers idempotent and quick to answer; slow work in a queue.
- [ ] 429 handled with `retry_after`; broadcasts throttled and resumable; blocked users (403)
      marked and skipped.
- [ ] `/start` copes with missing, unknown and old deep-link parameters.
- [ ] Tested in a private chat, a group (privacy mode), and the Telegram test environment.
- [ ] Commands set with `setMyCommands`, description and about text, profile photo.

## Mini App

- [ ] `initData` validated on the server, with an `auth_date` limit.
- [ ] Works under the cross-origin restriction (no Mini App calls from embedded foreign pages).
- [ ] Theme, safe areas and full-screen checked on iOS, Android, Desktop and Web.
- [ ] Loading and error states; works on slow mobile networks.

## Payments

- [ ] Digital goods in Stars only. No crypto or card checkout for them.
- [ ] Pre-checkout answered within 10 seconds; fulfilment only on `successful_payment`, unique on
      `telegram_payment_charge_id`.
- [ ] `/terms` and `/paysupport` work; refunds tested with `refundStarPayment`.
- [ ] Payment records backed up; reconciliation with `getStarTransactions`.

## TON parts (if any)

- [ ] Network shown in the UI; testnet and mainnet configs can't be mixed up.
- [ ] Payments credited only from `finalized` (or a documented `confirmed` choice for cheap goods),
      with a checkpoint and catch-up after restarts.
- [ ] Jetton masters allowlisted; `ton_proof` verified on the server with a one-time nonce.
- [ ] Contracts reviewed by the `ton-security-reviewer` agent; a human audit for anything that
      holds real value. Mainnet deployment is done by the user.

## Hosting and operations

- [ ] HTTPS with a valid certificate; a health check; restarts on crash.
- [ ] Logs without personal data or secrets; alerts on error spikes and webhook failures
      (`getWebhookInfo` shows `last_error_message` and pending updates).
- [ ] Database backups; a way to roll back a deploy.
- [ ] A privacy policy if you store any user data.

## Growth and money

Options Telegram offers today (terms change, link the official page instead of promising
numbers): Stars for digital goods and subscriptions, paid media, affiliate programs for bots,
revenue share from Telegram Ads in large bots and channels, paid broadcasts for high-volume
messaging, and converting Stars to Toncoin through Fragment. Source:
https://core.telegram.org/bots and https://telegram.org/tos/bot-developers.

Promotion that doesn't get the bot banned: users opt in before you message them, every broadcast
has a clear reason and an easy way to stop, no bought audiences, no userbot spam.
