# Proving wallet ownership with ton_proof

A wallet address sent by the client proves nothing. To log a user in by wallet, or to bind a
wallet to a Telegram account, use TON Connect's `ton_proof`.

Source: https://docs.ton.org/applications/ton-connect/how-to/ton-proof (checked October 2026;
the TON Connect spec is `ton-blockchain/ton-connect`, `spec/connect.md`). Prefer a maintained
verification library or the official demo backend over re-implementing the byte layout.

## Flow

1. **Backend issues a payload.** Unpredictable, single-use, short-lived, tied to the login
   attempt. Keep it short: the SDK allows at most 128 UTF-8 bytes for the domain, 128 for the
   payload and 222 for both together.
2. **Front end passes it before opening the wallet modal:**

   ```ts
   tonConnectUI.setConnectRequestParameters({ state: "ready", value: { tonProof: payload } });
   ```

   Refresh the payload periodically if the page stays open. Set `state: "loading"` while it is
   being fetched.
3. **Read the proof** in `tonConnectUI.onStatusChange`: `wallet.connectItems.tonProof`. A wallet
   that doesn't support `ton_proof` returns an error item instead of `proof`; handle both.
   Send `wallet.account` and `proof` to the backend.
4. **Backend verifies**, then issues its own session token.

## What the backend must check

Reconstruct the signed message:

```text
message = "ton-proof-item-v2/" ++ Address ++ AppDomain ++ Timestamp ++ Payload
  Address   = workchain (int32, big-endian) ++ hash (256 bit)
  AppDomain = lengthBytes (uint32, little-endian) ++ UTF-8 domain
  Timestamp = uint64, little-endian, seconds
  Payload   = the exact UTF-8 payload from your request
digest    = sha256( 0xffff ++ "ton-connect" ++ sha256(message) )
```

The signature is Ed25519 over `digest`. Mainnet and testnet use the empty signature domain;
other global ids use an L2 domain. Then:

1. Get the public key: **preferably from `walletStateInit`** (identify the wallet version by its
   code hash and parse the data layout); fall back to the on-chain `get_public_key` get method.
2. The public key equals the `publicKey` the wallet reported.
3. `contractAddress(workchain, walletStateInit)` equals the claimed address.
4. The domain is one of **your** allowed domains, and `lengthBytes` equals its UTF-8 length.
5. The timestamp is within a short window, with a bound on future clock skew (the official demo
   uses 15 minutes).
6. The payload belongs to this login attempt, is unexpired and is **consumed atomically**, so
   it can never be used twice. A signed token alone doesn't make it single-use; store a nonce id
   and delete it on first use.
7. The **network** is one your app accepts. The ton_proof signature does not bind the network,
   so you must check it yourself.

The SDK exposes `timestamp` as a number while the wire format is a decimal string; accept
both and normalise before verifying.

## Mini App specifics

- Validate Telegram `initData` first (see `init-data-validation.md`) so you know the Telegram
  user, then run ton_proof and store the pair `telegram_user_id ↔ wallet address`.
- Treat a change of wallet as security-relevant: ask for a fresh proof.
- Compare addresses in one normalised form. TON Connect requires user-friendly (TEP-2) form
  for transaction destinations, not raw `workchain:hex`.

## Pitfalls

- Reusing nonces, or issuing them without server-side state.
- Verifying the signature but not that the public key belongs to the address.
- Skipping the domain check, which lets another site replay a proof.
- Treating a connected wallet as authenticated without a proof.
- Treating the proof as a payment authorisation. It only shows key ownership.
