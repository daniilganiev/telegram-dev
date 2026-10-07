# Reading TON from a backend or while debugging

The plugin doesn't ship a wallet or an MCP server. Read the chain over HTTP with the public
TON Center API v3 and let the user sign anything that moves funds in their own wallet.

Sources: https://docs.ton.org/api/v3/overview, `.../api/v3/authentication`,
`.../api/v3/pagination`. Checked October 2026.

## Hosts and keys

| Network | Base URL |
|---|---|
| Mainnet | `https://toncenter.com/api/v3` |
| Testnet | `https://testnet.toncenter.com/api/v3` |

- Without a key: about **1 request per second**. With a key, send `X-API-Key: <key>` (or
  `?api_key=`). Keys are **per network**: a testnet key on mainnet returns `403 Network not
  allowed`.
- `401` is a wrong key, `429` is the rate limit: back off exponentially, don't retry in a loop.
- The key belongs on the backend (env var). Never put it in the Mini App bundle.

## Endpoints you'll use most

| Goal | Request |
|---|---|
| Recent transactions of an address | `GET /transactions?account=<addr>&limit=20&sort=desc` |
| Next page | same with `&offset=<n>`; for a payment worker prefer a checkpoint on `lt` |
| Find the transaction for a sent message (UX only) | `GET /transactionsByMessage?msg_hash=<hash>` |
| Whole trace of a transaction | `GET /traces?tx_hash=<hash>` |
| Wallet type, seqno, state | `GET /walletInformation?address=<addr>` |
| Jetton wallets of an owner | `GET /jetton/wallets?owner_address=<addr>&jetton_address=<master>` |
| Jetton master metadata | `GET /jetton/masters?address=<master>` |
| Jetton transfers | `GET /jetton/transfers?...` |
| NFT items of an owner / collection | `GET /nft/items?owner_address=<addr>` or `?collection_address=<addr>` |
| Run a getter | `POST /runGetMethod` with `address`, `method`, `stack` |
| Address forms (raw / friendly) | `GET /addressBook?address=<addr>` |

Filter parameter names beyond `account`, `limit`, `offset` and `sort` differ per endpoint;
open the endpoint page under https://docs.ton.org/api/v3/ before relying on one. Old indexer v1
(`/api/index`) is disabled.

## Debugging a failed transaction

1. Fetch the transaction (`/transactions` or `/traces`) and note the compute phase exit code,
   the action phase result, outbound messages and bounces.
2. Map the exit code: 0/1 success; 2-14 VM errors (7 type check, 9 cell underflow, usually a
   wrong read order, 13 and -14 out of gas); 32-50 action phase (37 not enough funds);
   100-65535 developer-defined, `65535` usually "unknown opcode". Full table:
   https://docs.ton.org/tvm/exit-codes.
3. A wallet external message rejected with `gas_used=0` was refused before running; codes like
   33 or 35 on a wallet usually mean seqno or signature (community-reported).
4. Common causes: too little attached value for gas and forwards, wrong sender, wrong opcode,
   a bounce of an outgoing message, frozen account (unfreezer.ton.org).
5. For a local replay of a real transaction: `acton retrace` (see `acton-cheatsheet.md`).

## Previewing before signing

Prefer emulation over "send and see": `POST /estimateFee` for fees, the TON Connect wallet's own
preview, or `acton` emulated scripts for contracts. Show the user network, destination and
amount before any signature request.

## Reminders

- Testnet and mainnet are different chains with the same address formats. Confirm which one
  the user means and print it.
- Unknown jettons and NFTs may be spam. Don't present them as the user's real assets.
- Never ask for a seed phrase or private key to "check" something. Reading needs only the
  address.
