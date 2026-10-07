# Accepting TON and jetton payments

Sources: https://docs.ton.org/applications/payments/overview, `.../payments/gram`,
`.../payments/jettons`, `.../ton-connect/how-to/send-transaction`, the TON Center Streaming API
docs. Checked October 2026.

Naming: Toncoin is also called **Gram**. The smallest unit is 10^-9. Keep amounts as integers
(BigInt or strings), never floats.

## Scope: where TON payments are allowed

Telegram requires **Telegram Stars** for the sale of digital goods and services inside bots and
Mini Apps, and says other currencies, including cryptocurrency, are not allowed for them (App
Store and Play Store rules). A bot or Mini App that tries may stop being shown to mobile users.
So before designing a TON checkout, ask what is being sold:

- Digital goods or services inside Telegram → use the `telegram-payments` skill, not this reference.
- Physical goods and services, payouts to users, deposits and withdrawals of on-chain assets,
  and flows outside Telegram apps → TON is a fit. If it is borderline, point the user to
  Section 6.2 of the Telegram Bot Platform Developer Terms rather than deciding for them.

Write the decision into `PRODUCT.md`.

## Pick the lightest option

1. **TON Pay SDK** (https://docs.ton.org/ecosystem/ton-pay/overview): payments, subscriptions and
   status tracking on top of TON Connect. Read its current docs before writing code; the pages
   moved recently.
2. **Plain transfer + backend verification** (below).
3. **A payment contract** only for on-chain logic such as escrow or splits. Every contract is an
   audit surface; see `contracts.md`.

## Two deposit architectures

| | One shared address + invoice id in the comment | A unique deposit address per user |
|---|---|---|
| Key risk | One hot wallet; a key leak drains everything | Many keys to manage; leaks are contained |
| User error | Missing or wrong comment loses attribution | Only needs the address |
| Monitoring | Poll one address, parse comments | Track many addresses |
| Withdrawals | Highload wallet batches from one balance | Sweeps from many wallets |

Shared address: generate a unique invoice id per order, enforce the format, hold or reject
unmatched deposits and provide a recovery path. Unique addresses: derive them deterministically
(for example V4/V5 wallets with different `subwallet_id`); never send funds to an address you
couldn't initialize, and send the first deposit to a not-yet-deployed address as
**non-bounceable** (a bounceable message would return the funds).

## Order flow (shared address)

1. Backend creates the order before payment: unguessable id, price in smallest units, asset,
   merchant address, expiry, network. Store it.
2. The app shows amount, destination and network, then calls TON Connect `sendTransaction`:
   `validUntil` (now + a few minutes), explicit `network` (`-239` mainnet, `-3` testnet), and
   `messages` with a user-friendly (TEP-2) `address`, `amount` as a string of smallest units and
   `payload` (a text-comment cell holding the order id). Prefer `messages` over structured
   `items` (alpha, uneven wallet support).
3. Backend finds the incoming transaction by **polling the merchant address or a stream**, not by
   trusting the browser, and verifies all of: destination and network; payload carries a known,
   unpaid, unexpired order id; value at least the price (integer comparison); compute and action
   phases succeeded and the message wasn't bounced; finality deep enough (below).
4. Fulfil once, keyed on transaction hash and order id.
5. Persist a checkpoint (last processed `lt` and hash) so a restart doesn't reprocess or skip.

**Message lookup is UX only.** The BOC that `sendTransaction` returns lets you show progress
(look the transaction up by its normalized external-message hash, TEP-467), but the docs
say to never use external-message tracking to decide a payment happened. Credit from the
incoming transaction on the merchant address.

## Finality

Streaming API traces carry `finality`: `pending` (emulation, can be invalidated), `confirmed`
(in a candidate shard block, rollback chance very small but possible) and `finalized` (committed
in the masterchain, never changes). Rules:

- Never fulfil on `pending`.
- `confirmed` is acceptable for cheap, easily reversible goods; write that choice down.
- Wait for `finalized` before irreversible or valuable actions (shipping, releasing funds,
  crediting withdrawable balances).

The Streaming API (SSE or WebSocket, with `min_finality`) **does not replay missed events**.
After any disconnect or restart, resynchronize by polling the indexer API (v3) from your
checkpoint. Old indexer v1 (`/api/index`) is disabled; use `/api/v3`.

## Reliability and rate limits

- TON Center without an API key allows about 1 request per second; the free plan with a key,
  10 rps. Keys and limits are **per network** (a mainnet key doesn't work on testnet). On HTTP
  429, stop and back off exponentially.
- Use more than one RPC provider with fallback, and compare results if something looks off.
- Log every decision (credit, reject, refund) with hash, `lt`, amount and order id.

## Jetton payments

All jetton processing needs an **allowlist of trusted jetton masters**. Anyone can deploy a fake
jetton wallet or a fake master with the same name, symbol and image; never trust metadata.

Setup: for each allowlisted master, call `get_wallet_address(<your deposit wallet>)` on the master
and store master → jetton wallet → deposit wallet.

For each incoming transaction on the deposit wallet, in this order:

1. `in_msg.source` equals the stored jetton wallet for that master.
2. Confirm the relationship again by calling `get_wallet_address` on the master.
3. The transaction has no outgoing messages (a single message back to the sender looks like a
   bounce).
4. The body opcode is `0x7362d09c` (`transfer_notification`); parse `query_id`, `amount` (base
   units, not decimals), `sender` and `forward_payload` per TEP-74. `forward_payload` may be
   malformed; parse defensively.
5. The amount matches the expected value; match the order id from `forward_payload`; mark the
   invoice used on the first success.

A transfer only counts when the recipient gets `transfer_notification`, which requires a
`forward_ton_amount` of at least 1 nano-unit. When **you** send jettons, set it, or exchanges
and other services may not process the transfer. Users can omit the comment, so decide what
happens to unmatched deposits.

Inspect jetton wallets and transfers while debugging through TON Center (`chain-reading.md`).

## Abuse patterns to test for

- Reusing a settled invoice id for a second credit (invalidate after first use).
- Changing the amount but keeping the invoice id (enforce the expected amount).
- A comment that mimics another user's invoice id to hijack their pending credit.
- Floods of dust payments to inflate processing cost or burn your rate limit.
- Fake jetton wallets and fake masters (allowlist and derive addresses).
- Address poisoning: look-alike addresses in history. Always show the full destination and never
  let users copy a recipient from their history list.

## Payouts

- For automated withdrawals prefer a **Highload wallet** (parallel messages, processed ids
  instead of seqno). Reported pitfalls: reusing a query id; a `created_at` that runs ahead of the
  node's last block time (subtract a small margin).
- Sending to a custodial or exchange address without the required comment can make the
  deposit unattributable. Validate that the destination accepts a bare transfer.
- Never send to an address you can't initialize or verify; test the full flow on testnet.

## Testing

Run everything on testnet with a testnet wallet and coins before mainnet; check outcomes through
the testnet TON Center API (`chain-reading.md`). Test: deposit,
credit, withdrawal, confirmation, wrong network, fake jetton, reused invoice, missing comment.
Mainnet stays blocked by this plugin's hooks unless the user opts in.
