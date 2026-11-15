# HTML widgets with the TON wallet (Bot API 10.4)

Checked against https://core.telegram.org/bots/widgets and the Bot API changelog on
15 November 2026. Re-check both before building: this feature changes fast.

## Status first

- Added in Bot API 10.4 (9 November 2026).
- **Since 13 November 2026 general bots can't send widgets in production, even in private
  chats**: `sendWidget` fails with `INPUT_MEDIA_WIDGET_NOT_ALLOWED`. Confirmed by Telegram
  (https://github.com/tdlib/telegram-bot-api/issues/947), no date for reopening.
- The test server still has the full set (private chats, groups, inline mode, forwards).
  Build and test there; tell the user the production launch depends on Telegram reopening access.

## The Stars rule still applies

The widget wallet is a crypto payment. Section 6.2 of the Bot Platform Developer Terms is
unchanged: **digital goods and services are paid only in Stars**. A widget "Pay in TON" button
for in-app items, access or content breaks it. Use the wallet for the same cases as TON Connect:
physical goods, deposits, payouts, on-chain assets, wallet login.

## What a widget is

One self-contained HTML document (inline CSS and JS) inside a message. It runs in a QuickJS
sandbox: no network (`fetch`, `XMLHttpRequest`, `WebSocket` throw `NetworkDisabledError`), no
external scripts, styles, fonts or images, no dialogs. Limits: HTML 1-32768 bytes and at most
4096 bytes after zlib level 9; `public_data` and `chat_data` up to 1024 bytes each.

Code is fixed at send time; only state changes, and only the bot writes it
(`editMessageWidgetData`, `editSharedWidgetData`). The widget asks the bot with
`TelegramWidget.request(data, options)` (data 1-64 bytes); the bot gets a `widget_query`
update and must call `answerWidgetQuery` within 15 seconds (answer data up to 1024 bytes), or
the widget gets `TIMEOUT`. Limit: 5 requests per 5 seconds per user and bot. Send with
`allow_queries: true`, or requests fail with `NOT_ALLOWED`. Always send a `caption`: apps
without widget support show it instead.

Code and state are public: never put a secret into either.

## Payment flow

```js
// In the widget, on a tap
if (TelegramWidget.wallet) {               // null: no wallet in this app, preview, no requests
  TelegramWidget.request('pay:42', { wallet: true })
    .then((a) => TelegramWidget.wallet.sendTransaction(JSON.parse(a.result), 'paid:42'))
    .then((a) => show(a.result), (e) => showError(e.code));
}
```

1. `request(data, { wallet: true })` on a tap: the bot's query has type
   `{ "type": "data", "wallet_card": TonWalletCard }` (the profile's wallet address and balance).
2. The bot creates the order on its side and answers with a fresh TON Connect `sendTransaction`
   request: `{ valid_until, messages: [{ address, amount, payload?, stateInit? }] }`, 1-255
   messages, user-friendly addresses, amounts in nanotons as decimal strings. Leave out `from`:
   the paying wallet is the one on the device and can differ from the profile's card.
3. The widget calls `wallet.sendTransaction(tx, data)` within 10 seconds of that answer.
   The user confirms in Telegram's wallet window.
4. The bot gets `{ "type": "sent_transaction", "wallet": WidgetQueryWallet, "msg_hash": ... }`.
   **Verify the transaction on chain** (sender, recipients, amounts, success, finality) with
   `chain-reading.md`, never by the hash alone, then fulfil once (idempotent per order) and
   answer.
5. `REJECTED`: the user declined. `BAD_REQUEST`: the wallet refused the transaction.
   After `TIMEOUT` the payment may have gone out: check the order on the bot side, never resend
   blindly.

## Signing

`wallet.signData(payload, data)` takes a TON Connect payload (`{ type: 'text', text }`,
`{ type: 'binary', bytes }` or `{ type: 'cell', schema, cell }`). The bot gets
`{ "type": "sign_data", "wallet": ..., "sign_data": "<JSON>" }`, signed for the domain
`bot<bot_id>`. Check the signature with the wallet's `public_key` and tie that key to the
address on chain (`public_key` and `state_init` may be omitted; then check the key through the
wallet's get-methods). Use a one-time nonce in the payload, as with
`ton_proof`.

## Trust

`from` and `widget_id` in a query come from Telegram and can't be forged. `data` is untrusted
input, like `callback_data`. Keep the authoritative order state on the server; for forwards and
paid actions key on (`widget_id`, `from.id`).

## Related Bot API 10.4 additions

- `ChatFullInfo.ton_wallet_card` (`TonWalletCard`: `address`, `amount`, `stickers`,
  `background_nft_address`): the wallet shown on a user's profile, private chats only.
- `Message.ton_wallet_transfer` (`TonWalletTransfer`: `transaction_id`, `peer_address`,
  `amount` negative for outgoing, `comment` omitted if encrypted): service message about a
  transfer. A service message isn't proof of payment; check the chain.
- Message entity types `ton_address` and `bank_card_number`; `RichTextTonAddress` in rich messages.
- `StoryAreaPosition` was renamed to `AreaPosition`.
