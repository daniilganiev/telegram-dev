# TON contract security checklist

Use before testnet release and again before any mainnet discussion. Based on the official
"Security best practices" page (https://docs.ton.org/contracts/techniques/security), the Jetton
processing guide and the Tolk docs, checked October 2026. Nothing here replaces an audit.

## Access control
- [ ] Every state-changing handler checks the sender where it should. Authenticate with
      `in.senderAddress`, never with an address supplied in the message body.
- [ ] Admin/owner address can be changed or renounced deliberately, not accidentally.
- [ ] No handler lets an arbitrary sender redirect funds, change code or destroy the account.

## Asynchronous messages
- [ ] No step assumes a multi-contract flow is atomic. A cascade runs over many blocks and an
      attacker can start a second flow in parallel, so re-check properties (balance, ownership)
      at each stage instead of trusting what was true at the start.
- [ ] A contract cannot call another contract's getter. Pull data by exchanging messages, and
      on the reply verify `in.senderAddress` is the contract you asked.
- [ ] Bounced messages are handled (`onBouncedMessage`) and roll back optimistic state changes.
      The bounce mode (`NoBounce`, `Only256BitsOfBody`, `RichBounce`) is a conscious choice and
      not mixed across messages without a plan.
- [ ] Message ordering between different contracts is not assumed.

## External messages and signatures
- [ ] `acceptExternalMessage()` is only reached after the request is validated (signature,
      seqno, expiry). An unconditional accept lets anyone drain the balance in gas.
- [ ] Replay protection: bind a seqno to a signed request that also carries a contract-specific
      id and an expiry. A seqno alone is not authentication.
- [ ] Signed data includes the recipient and every parameter that matters, otherwise a
      front-runner can copy the signature and redirect the action. Mempool contents are public.
- [ ] Don't use randomness in external-message handlers.

## Value, gas and sending modes
- [ ] Each handler checks that attached value covers gas **and** storage fees, forward fees,
      outgoing action fees and any balance reserve. Checking value against gas alone is not enough.
- [ ] Out-of-gas can't be caught in code: measure worst-case paths in tests and keep explicit
      fee and reserve assumptions.
- [ ] Sending modes are intentional. `SEND_MODE_CARRY_ALL_BALANCE | SEND_MODE_DESTROY`
      (128 + 32) is irreversible and racy: require authorization and an explicit terminal state,
      and settle pending operations first.
- [ ] Unused value is returned to the sender (`excesses`, opcode `0xd53276db`) instead of
      accumulating in the contract.
- [ ] Amount arithmetic uses unsigned types and validates input (`amount > 0`, `balance >= amount`).
      Tolk arithmetic is 257-bit at run time; fixed-width types mainly constrain serialization,
      so a negative `int` from a message can reverse an operation.

## Data and errors
- [ ] Nothing private is stored or sent on-chain. State, messages and emulation are public, and
      hashing a low-entropy secret doesn't hide it.
- [ ] Unbounded dictionaries and lists can't be grown by untrusted users.
- [ ] Addresses: validate the workchain, and know the formats (below). Verify the recipient is
      initialized before sending value to it.
- [ ] Throw named codes in the developer range (100-65535). Codes 0 and 1 mean success, and the
      range 0-127 is reserved by the VM. `0xFFFF` is the conventional "unknown opcode".
- [ ] Types are read the way they were written (`storeUint` / `loadUint`); return values (for
      example the success flag of a dictionary delete) are checked.
- [ ] Randomness: call `random.initialize()` first. For anything valuable use commit-and-disclose
      or an off-chain design; on-chain randomness is only pseudo-random.
- [ ] Contract state is public, and so are its getters; don't rely on obscurity.

## Address formats
- A raw address `workchain:hash` and its user-friendly forms are the same account. The four
  friendly prefixes are `E` (bounceable mainnet), `U` (non-bounceable mainnet), `k` (bounceable
  testnet), `0` (non-bounceable testnet). The same contract has the same raw address on testnet
  and mainnet; only the friendly flag differs.
- Compare parsed addresses, never address strings.
- Send to **bounceable** addresses for contracts (funds return if it fails) and to
  **non-bounceable** addresses for wallets that may be uninitialized (funds are credited).

## Code upgrades
- [ ] If code is upgradable, who can upgrade is documented and restricted
      (`setCodePostponed` behind an admin check).
- [ ] If not upgradable, that is a conscious decision documented in PRODUCT.md.

## Token contracts
- [ ] Receivers accept `transfer_notification` only from the jetton wallet derived from an
      allowlisted minter (see `ton-payments.md`).
- [ ] Mint authority, supply cap and admin rotation are documented and tested.
- [ ] NFT items are checked against their collection (ask the collection for the item address
      at that index and compare), because an item can claim any collection.

## Process
- [ ] Tests cover every item above that applies; coverage report reviewed; mutation testing run.
- [ ] Deployed on testnet and exercised through the real Mini App.
- [ ] Source verified (see `acton verify`, which is testnet-only; check
      https://verifier.ton.org for mainnet).
- [ ] External audit considered for anything holding meaningful value.
