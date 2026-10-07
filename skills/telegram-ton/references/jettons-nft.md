# Jettons and NFTs on TON

Don't write these from scratch. Scaffold from Acton's templates, which include contracts,
wrappers, tests, a deploy script and CI:

```bash
acton new my_token --template jetton --app   # multi-contract jetton scaffold
acton new my_nft   --template nft    --app   # collection + item contracts
```

Run `acton new --help` for the current template list. Customise only what the product needs
and keep the standard message layouts so wallets and explorers keep working.

For a plain token with no custom logic, the Jetton-2.1-tolk minter at https://minter.ton.org
deploys a standard contract without code. That is a user action in a browser with their own
wallet; this plugin never signs mainnet deployments (see Safety rules in
the `telegram-ton` skill).

## Jetton architecture (TEP-74)

- One **minter** holds total supply, admin and metadata.
- Every holder has their own **jetton wallet** contract holding the balance.
- Transfer: owner → their jetton wallet (`transfer`, `0x0f8a7ea5`) → recipient's jetton wallet
  (`internal_transfer`, `0x178d4519`) → notification to the recipient owner
  (`transfer_notification`, `0x7362d09c`) and leftover value back as `excesses`
  (`0xd53276db`). Burn is `0x595f07bc`.
- The flow is asynchronous across three contracts; no step is atomic.

## Decisions to make and record in PRODUCT.md

- Supply model: fixed, capped or open mint. Who can mint, and can the right be renounced?
- Admin: single key, multisig, or none. How is it rotated? (multisig.ton.org exists.)
- Decimals and display name; on-chain vs off-chain metadata (TEP-64). Off-chain metadata
  needs stable hosting.
- Upgradeability: avoid unless you need it, and restrict who may upgrade.

## Receiving jettons safely

See `ton-payments.md`: keep an allowlist of trusted minters, verify the sender of every
`transfer_notification` is the jetton wallet that minter derives for you (`get_wallet_address`),
and never credit from an unverified notification. When you send jettons, set
`forward_ton_amount` to at least 1 nano-unit or recipients won't receive a notification. Never
trust `forward_payload` for amounts, only for matching an order.

## NFTs (TEP-62)

- A **collection** contract deploys and indexes **item** contracts; each item stores owner
  and content.
- Royalties follow TEP-66. Metadata is TEP-64.
- Decide who can mint and the mint price, and cap the supply if the product promises scarcity.
- Don't make collection state grow without bound; a stranger must not be able to bloat it.
- An item can claim any collection. To check membership, ask the collection contract for the
  item address at that index and compare it with the item's address.
- Explorers may label look-alike names as scam; keep names and images clearly your own.

## Testing

Use the template's tests as a base and add: wrong-sender transfers, bounced transfers, zero
and maximum amounts, burn flows, mint by non-admin, and notification spoofing. See
`testing-recipes.md`.

## Before mainnet

Run the `ton-security-reviewer` agent and consider an external audit for anything that holds
value. Source verification (the user runs it): `acton verify` works against the TON verifier on **testnet** and pays
a testnet fee; for mainnet, use https://verifier.ton.org yourself.

## Display hygiene

Only list well-known jettons and NFTs by default. Spam collections are common.
