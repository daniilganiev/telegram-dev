---
name: telegram-payments
description: Charge users inside Telegram — Telegram Stars (currency XTR) for digital goods, subscriptions, paid media, gifts and paid broadcasts, card providers for physical goods, refunds and go-live requirements, in TypeScript (grammY) or Python (aiogram). Use this skill whenever the user wants to sell anything in a Telegram bot or Mini App, mentions Stars, XTR, sendInvoice, createInvoiceLink, openInvoice, pre_checkout_query, successful_payment, refunds, /paysupport, subscriptions, paid content, gifts or donations, or asks how to take money in Telegram, including "accept crypto for in-game items".
---

# Payments in Telegram

Official references: https://core.telegram.org/bots/payments-stars,
https://core.telegram.org/bots/payments and the Payments section of the Bot API. Checked October
2026; re-check limits before relying on them.

## The rule that decides everything

Telegram requires that **digital goods and services** sold inside bots and Mini Apps are paid
**only in Telegram Stars** (`XTR`). Crypto (including TON and jettons) and third-party card
providers are **not allowed** for them because of App Store and Play Store rules; an app that
tries can stop being shown to mobile users. A separate website with other payment methods does
not change what is allowed inside Telegram.

| Selling | Use |
|---|---|
| In-app items, game currency, premium features, access, content, AI credits | Stars |
| Subscriptions to digital content | Stars subscription |
| Photos or videos behind a paywall | `sendPaidMedia` (Stars) |
| Physical goods and services | a payment provider from @BotFather (cards), currency of your choice |
| Payouts, deposits, on-chain assets the user owns | TON is possible, see `telegram-ton` |

When a user asks for a crypto checkout for digital goods, say this first and propose Stars; don't
silently build what they asked for. Borderline cases: point to Section 6.2 of the Telegram Bot
Platform Developer Terms and record the decision in `PRODUCT.md`.

## Stars flow

1. **Invoice.** `sendInvoice` into a chat, or `createInvoiceLink` for a link a Mini App opens with
   `WebApp.openInvoice(url)`. `currency: "XTR"`, empty `provider_token`, **exactly one** item in
   `prices`. Title 1-32 chars, description 1-255, `payload` 1-128 bytes (an opaque order id).
2. **Pre-checkout.** Answer `pre_checkout_query` within **10 seconds** with
   `answerPreCheckoutQuery`, after checking the order exists, is unpaid and the price matches. On
   failure pass a human-readable `error_message`. Keep this handler fast: no slow calls.
3. **Fulfil only on `successful_payment`.** Answering pre-checkout doesn't mean money arrived.
   Store `telegram_payment_charge_id`; key fulfilment on it so a redelivered update never grants
   twice.
4. **Refunds:** `refundStarPayment(user_id, telegram_payment_charge_id)`.
5. **Reconcile:** `getStarTransactions` (pages of up to 100) and `getMyStarBalance`.

Price and item always come from the server, never from the client. Reject payloads you didn't
create, orders of another user, and orders already paid.

## Subscriptions, paid media, gifts

- `createInvoiceLink` with `subscription_period: 2592000` (it must be exactly 30 days today),
  `XTR`, price up to 10000 Stars. Renewals arrive as `successful_payment` with
  `is_recurring`; changes to a user's subscription also come as `subscription` updates
  (Bot API 10.2). Cancel or resume renewal with `editUserStarSubscription`.
- `sendPaidMedia`: 1-25000 Stars per item.
- `sendGift` sends a gift from the bot's Stars balance to a user or channel; the receiver can't
  convert it to Stars. `giftPremiumSubscription` gifts Premium for Stars.
- Forwarded invoices and inline invoices can be paid by many users. Accept repeated payments only
  if each can be fulfilled (stock, per-user limits); `start_parameter` makes an invoice
  single-chat.

## Code shape

TypeScript (grammY):

```ts
bot.on("pre_checkout_query", async (ctx) => {
  const order = await orders.findPending(ctx.preCheckoutQuery.invoice_payload, ctx.from.id);
  if (order) await ctx.answerPreCheckoutQuery(true);
  else await ctx.answerPreCheckoutQuery(false, { error_message: "This order has expired." });
});

bot.on("message:successful_payment", async (ctx) => {
  const p = ctx.message.successful_payment;
  await orders.markPaidOnce(p.invoice_payload, p.telegram_payment_charge_id); // unique on charge id
});
```

Python (aiogram 3):

```python
from aiogram import F, Router
from aiogram.types import LabeledPrice, Message, PreCheckoutQuery

router = Router()


async def send_invoice(message: Message, order) -> None:
    await message.answer_invoice(
        title=order.title,
        description=order.description,
        payload=order.id,
        currency="XTR",
        prices=[LabeledPrice(label=order.title, amount=order.stars)],
    )


@router.pre_checkout_query()
async def pre_checkout(query: PreCheckoutQuery) -> None:
    order = await orders.find_pending(query.invoice_payload, query.from_user.id)
    if order:
        await query.answer(ok=True)
    else:
        await query.answer(ok=False, error_message="This order has expired.")


@router.message(F.successful_payment)
async def paid(message: Message) -> None:
    p = message.successful_payment
    await orders.mark_paid_once(p.invoice_payload, p.telegram_payment_charge_id)
```

Signatures move between framework versions; check the current docs if a call fails. If the
webhook filters updates, `allowed_updates` must include `pre_checkout_query` and `message`.

## Testing

Telegram has a separate **test environment** where Stars payments are free
(https://core.telegram.org/bots/webapps#using-bots-in-the-test-environment). Run the whole flow
there: invoice, pre-checkout, success, duplicate update, refund.

## Go-live requirements

- [ ] 2-step verification on the Telegram account that owns the bot.
- [ ] `/terms` (or an equally easy link) with clear terms; users agree before buying.
- [ ] `/paysupport` answered promptly; users told that Telegram support can't help with purchases
      made through your bot.
- [ ] You handle disputes and refunds yourself.
- [ ] Stable hosting and backups of payment records; logs keep charge ids and order ids, not
      personal data.

Before launch, run the `telegram-security-reviewer` agent on the payment code.
