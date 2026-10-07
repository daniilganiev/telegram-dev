# Tolk contracts with Acton

Acton is the toolchain for new TON contracts (Blueprint is legacy but still supported). It
covers scaffolding, build, tests, scripting, wallets, deployment, verification, linting and
formatting in one CLI. Tolk itself is at v1.5 (October 2026); see `tolk-essentials.md`
for version notes. **On Windows, Acton runs only inside WSL (Ubuntu 22.04+); native Windows is
not supported.** If `acton` isn't found, check this before anything else.

## Core loop

```bash
acton build          # compile
acton test           # run Tolk tests
acton check          # lint
acton script contracts/scripts/deploy.tolk   # local emulated deploy, no network
```

Run `acton help <command>` for exact flags. Don't invent flags; check help first.

## How to write a contract

1. Declare the contract (`contract Name { storage: ..., incomingMessages: ... }`) at the top of
   the entry file, named in PascalCase.
2. Model storage as a `struct` with `load()`/`save()` helpers; structs serialize automatically.
3. Every incoming message is a struct with a 32-bit opcode prefix, combined into a union and
   handled with `lazy` + `match`, with an `else` branch that ignores empty bodies and throws
   `0xFFFF` for unknown opcodes.
4. For each handler, write down: who may call it, what it changes, what it sends, how much
   value it needs, and what happens if an outgoing message bounces.
5. Return structs from getters, with every value the Mini App needs.
6. Write tests before the Mini App: happy path, wrong sender, insufficient value, bounced
   messages, replays, boundary amounts.

For Jettons and NFTs use Acton's `jetton` / `nft` templates and the standard TEPs rather than
writing your own (`jettons-nft.md`).

## References

- `tolk-essentials.md` — verified syntax: messages, storage, sending, bounces,
  getters, version notes (`ton()` is deprecated, use `grams()`).
- `acton-cheatsheet.md` — commands, templates, test flags, wallets, WSL.
- `testing-recipes.md` — test patterns: failures, bounces, time, gas, fuzzing.
- `security-checklist.md` — before any release; based on the official TON
  security guide.

## TON-specific pitfalls

Everything is asynchronous messages (no atomic multi-contract calls), contracts pay for their
own storage, failed outgoing messages return as bounces your code must handle, contracts can't
call each other's getters, and all state is public. Read `security-checklist.md`
before calling any contract "done".

## Reading failures

When a transaction fails, look at the exit code. 0 and 1 are success; 2-14 are VM errors
(for example 9 is cell underflow, often a wrong read order or layout in a message body, and 7
is a type error); 13 and -14 are out of gas; 32-50 are action-phase errors (37 is not enough
funds); developer codes start at 100, and `65535` conventionally means "unknown opcode".
Full table: https://docs.ton.org/tvm/exit-codes. Debug locally with `acton test` traces, or
replay a mainnet transaction with `acton retrace`.

## Deployment

There is no `acton deploy` command; deployment is a Tolk script. Validate locally first, then
use `/telegram-dev:deploy-testnet`. Mainnet is out of scope here.
