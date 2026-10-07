# TON Connect troubleshooting

Source: https://docs.ton.org/applications/ton-connect/troubleshooting (checked October 2026),
plus recurring problems seen in developer communities (marked "reported").

## Manifest problems (the wallet never shows the connect prompt)

The wallet fetches `tonconnect-manifest.json` over HTTPS **from any origin, without
authentication**. Failures surface as `MANIFEST_NOT_FOUND_ERROR` (code 2) or
`MANIFEST_CONTENT_ERROR` (code 3). Open the manifest URL from outside your network (a phone
on mobile data works) and check the response in the browser's network panel, once plainly and
once from a page on another domain.

Expect 200, `Content-Type: application/json`, `Access-Control-Allow-Origin: *` (or the request
origin) and a body with `url`, `name`, `iconUrl`. Check with a GET request; a HEAD request can
answer differently.

Common causes:

- Wrong path or file missing from the build; manifest on a different domain than the app.
- CORS rules that only allow your own origin.
- **Cloudflare or another WAF returning an HTML challenge** (Bot Fight Mode, "Under Attack"):
  add an allow/bypass rule for `/tonconnect-manifest.json`.
- `iconUrl` unreachable or behind auth. The icon must be **PNG or ICO** (SVG is not supported),
  about 180x180. Drop a trailing slash from `url`.
- `localhost` or a private network: the wallet can't reach it. Use a public HTTPS tunnel.
- Caching: wallets may cache a broken manifest for up to 24 h. Rename it
  (`tonconnect-manifest-v2.json`) and update `manifestUrl` to force a refetch.

## Error codes

| Code | Name | Typical cause and action |
|---|---|---|
| 0 | `UNKNOWN_ERROR` | Wallet-side fallback. Read `message`; log `traceId` |
| 1 | `BAD_REQUEST_ERROR` | Raw `0:abc` address instead of user-friendly; both `messages` and `items`; unsupported item type; `validUntil` already past; `network` differs from the wallet's |
| 2 / 3 | manifest not found / content error | See above |
| 100 | `UNKNOWN_APP_ERROR` | Session revoked or `client_id` mismatch; clear local session and reconnect |
| 300 | `USER_REJECTS_ERROR` | The user cancelled; not a system error, let them retry |
| 400 | `METHOD_NOT_SUPPORTED` | Wallet lacks the feature (`SendTransaction`, `SignData`, structured `items`, `ton_proof` item). Filter wallets with `walletsRequiredFeatures` or fall back |

Bridge unreachable: the SDK retries the SSE channel every 2 s and `POST /message` every 5 s;
show a "connection problem" state and offer to reconnect. Methods take an `AbortSignal`.

## sendTransaction problems

- Prefer `messages` over structured `items` (items are alpha and many wallets don't advertise
  support). Never send both.
- `network` must be set explicitly (`-239` mainnet, `-3` testnet) and match the wallet.
- `address` must be user-friendly (TEP-2). Convert raw addresses first.
- `amount` is a string in the smallest unit; never a float. A reported case of one transaction in
  hundreds going out with the wrong amount came from float rounding.
- A batch is one external message but **not atomic**: each recipient can fail or bounce
  independently.
- Reported: the request "spins and disappears" on testnet. Check `validUntil` is not too short,
  the dApp and wallet are on the same network, the wallet account is deployed and funded
  (an uninitialized or empty testnet wallet can't pay), and that the testnet indexer isn't having
  an outage before blaming your code.
- The returned `boc` is the external message. Its hash is not the transaction hash; look the
  transaction up by the **normalized external-message hash** (TEP-467). Use this for UX only,
  never to decide whether a payment arrived (see `ton-payments.md`).

## Privacy note

Recent `@tonconnect/sdk` / `ui` versions can send anonymous technical telemetry, controlled by
the `analytics` option in the SDK settings. If your privacy policy says nothing is collected,
check the option and the current SDK docs.
