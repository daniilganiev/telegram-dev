# Tolk essentials (verified against docs.ton.org/languages/tolk, October 2026)

Tolk is the current contract language; FunC is legacy. Read the real docs for anything not
covered here: https://docs.ton.org/languages/tolk. Version history is in the changelog
(https://docs.ton.org/languages/tolk/changelog); the language was at **v1.5** when this was
written, with a new backend planned for v2.0.

## Version notes that bite

- `ton("0.05")` is deprecated; use `grams("0.05")` (Toncoin is also called Gram).
- `bytesN` types were removed in 1.5; use `bitsN` (`bits512` instead of `bytes64`).
- Since 1.2 `address` means an **internal** address only. Use `address?` for "maybe none" and
  `any_address` when external or none must be allowed.
- Rich bounces (full original body on bounce) arrived in 1.2.
- 1.3 added `array<T>`, `string` + `StringBuilder`, `??`, import mappings, reflection.
- 1.4 added ABI export, TypeScript wrappers, source maps and step debugging.
- 1.5 added `break`/`continue`, `@inline` with several returns, better compile errors.
- Assistants and chat answers frequently show older syntax (`ton()`, FunC idioms). Check against
  the docs and compile; don't trust a snippet because it looks plausible.

## Project layout convention

`errors.tolk`, `storage.tolk`, `messages.tolk`, and an entrypoint named after the contract in
PascalCase (`JettonWallet.tolk`) with the `contract` declaration at the top and every
`get fun` and entrypoint in that file. All symbols share one namespace, so prefer methods
(`fun Struct.validate(self)`) over free functions to avoid collisions.

## Messages

```tolk
struct (0x12345678) CounterIncrement { incBy: uint32 }   // 32-bit opcode prefix
struct (0x23456789) CounterReset { initialValue: int64 }
type AllowedMessage = CounterIncrement | CounterReset

contract Counter {
    storage: Storage
    incomingMessages: AllowedMessage
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessage.fromSlice(in.body);
    match (msg) {
        CounterIncrement => { /* msg.incBy */ }
        CounterReset => { /* msg.initialValue */ }
        else => {
            // empty body = a plain top-up; anything else is an unknown opcode
            assert (in.body.isEmpty()) throw 0xFFFF
        }
    }
}
```

`in` exposes `in.body`, `in.senderAddress`, `in.valueCoins`. Use the standard opcodes when
implementing Jettons or NFTs. Use `lazy` whenever loading storage or messages (less gas).

## Storage

```tolk
struct Storage { counterValue: int64 }
fun Storage.load() { return Storage.fromCell(contract.getData()) }
fun Storage.save(self) { contract.setData(self.toCell()) }
```

Prefer typed cells (`Cell<T>`) and auto-serialization to hand-written slices and builders.

## Sending messages

```tolk
val reply = createMessage({
    bounce: BounceMode.NoBounce,
    value: grams("0.05"),
    dest: senderAddress,
    body: RequestedInfo { /* ... */ }
});
reply.send(SEND_MODE_REGULAR);
```

- Pass `body: obj`, not `obj.toCell()`; the compiler picks inline vs reference.
- `dest` can be an address, a `(workchain, hash)` pair, or `{ stateInit: { code, data } }` to
  deploy (the address is computed for you; add `toShard: { closeTo, fixedPrefixLength }` for
  same-shard deployment such as sharded jetton wallets).
- Keep `StateInit` generation in one function so you can both compute and message the address.
- External log messages for indexers: `createExternalLogMessage({ dest: ..., body: Event {...} })`.

## Bounces

```tolk
fun onBouncedMessage(in: InMessageBounced) {
    in.bouncedBody.skipBouncedPrefix();               // for Only256BitsOfBody
    val msg = lazy TheoreticallyBounceable.fromSlice(in.bouncedBody);
    match (msg) { TransferMessage => { /* revert optimistic changes */ } }
}
```

`BounceMode`: `NoBounce`, `Only256BitsOfBody` (cheapest), `RichBounce` (whole original body,
`exitCode`, `gasUsed`; most expensive), `RichBounceOnlyRootCell`. Don't mix modes.
`onInternalMessage` never receives bounced messages.

## Getters and errors

```tolk
get fun get_wallet_data(): JettonWalletDataReply { /* return a struct, not a bare tensor */ }
assert (msg.seqno == storage.seqno) throw E_INVALID_SEQNO;
```

Return structs from getters so wrappers and explorers get field names. Define errors as an
`enum` or constants in the 100-65535 range.

## Entrypoints

`onInternalMessage`, `onBouncedMessage`, `onExternalMessage(inMsg: slice)` (must call
`acceptExternalMessage()` after validation), `onRunTickTock`, and `main` for snippets.
