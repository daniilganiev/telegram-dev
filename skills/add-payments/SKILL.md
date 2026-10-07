---
description: Add payments to an existing Telegram bot or Mini App — Stars for digital goods by default, a card provider for physical goods, TON only where Telegram allows it. Optionally pass what is being sold.
argument-hint: [what is sold]
disable-model-invocation: true
---

# Add payments

What is sold: `$ARGUMENTS` (ask if empty).

1. Read the project: framework, language, where the bot handlers and the database are, whether a
   Mini App exists.
2. Decide the method with the `telegram-payments` rule and tell the user before writing code:
   digital goods and services → Stars; physical → a card provider; payouts and on-chain assets →
   TON (`telegram-ton`). If the user asked for crypto for digital goods, explain why that gets
   the app hidden on mobile and propose Stars.
3. Add an `orders` table or collection: id (opaque, unguessable), user id, item, price, status,
   `telegram_payment_charge_id` (unique), timestamps.
4. Server creates the order and the invoice (`sendInvoice` or `createInvoiceLink` for the Mini
   App). The client never sends a price.
5. Handlers: fast `pre_checkout_query` that checks the order, fulfilment on `successful_payment`
   keyed on the charge id, refund command for admins, `/terms` and `/paysupport`.
6. If the webhook sets `allowed_updates`, add `pre_checkout_query`.
7. Tests: duplicate `successful_payment`, unknown payload, another user's order, expired order,
   refund. Run them.
8. Run the `telegram-security-reviewer` agent on the result and report what is left to do,
   including testing in the Telegram test environment.
