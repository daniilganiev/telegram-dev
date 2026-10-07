# Telegram Mini App platform notes

Source: https://core.telegram.org/bots/webapps (re-check; the API is updated often, so test
inside real clients).

**Cross-origin hardening (Bot API 10.2).** Mini App methods can no longer be called from origins
other than the Mini App's own domain; Telegram enabled this for all Mini Apps on 20 July 2026,
and a bot owner can opt out in @BotFather. Don't embed or link untrusted sites inside your Mini
App, and don't turn the protection off unless you take responsibility for every link.

## Launching

Menu button, inline button with `web_app`, keyboard button, attachment menu, inline mode,
main Mini App link `https://t.me/<bot>?startapp`, and direct link
`https://t.me/<bot>/<app>?startapp=<value>`. The value arrives as `start_param`.
`WebApp.sendData` (up to 4096 bytes, closes the app) only works for apps launched from a
keyboard button.

## Methods you will use constantly

- `ready()`, `expand()`.
- Main/bottom button and back button for navigation; theme params (bind them to CSS variables
  with tma.js `themeParams.bindCssVars()`); safe-area and content-safe-area insets so UI doesn't
  sit under system bars.
- `openInvoice(url)` for Stars payments, `openTelegramLink(url)` for in-Telegram navigation.

## Storage tiers

| Tier | Size | Notes |
|---|---|---|
| CloudStorage | up to 1,024 items per user | synced across devices |
| DeviceStorage | up to 5 MB per user | local to the device |
| SecureStorage | up to 10 items | encrypted (Keychain/Keystore); use for sensitive local data |

None of these is trusted storage for money or entitlements; keep those on your server.

## Verifying init data without the bot token

`initData` includes a `signature` (base64url Ed25519). A third party that does not hold the
bot token can verify it: prepend `<bot_id>:WebAppData` to the data-check-string and verify
against Telegram's public key. Production key:
`e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d` (a separate test key
exists for the test environment). Bot-token HMAC validation stays the default for your own
backend; see `init-data-validation.md`.

## tma.js quick start

```ts
import { init, backButton, retrieveLaunchParams, themeParams } from "@tma.js/sdk";

init();
themeParams.mountSync?.(); // check the current API; mounting helpers differ by version
themeParams.bindCssVars();
backButton.mount();

const { tgWebAppData: initData } = retrieveLaunchParams();
```

For local development outside Telegram, tma.js can mock the environment; look up the current
`mockEnv` helper in its docs, and never ship the mock to production.

## TON Connect settings that bite

More in the `telegram-ton` skill (`tonconnect-troubleshooting.md`, `ton-proof-auth.md`).


- `tonconnect-manifest.json` must be public over HTTPS; icon PNG or ICO, 180x180, no CORS or
  auth gate.
- Network ids: `-239` mainnet, `-3` testnet.
- `validUntil` is a Unix timestamp, usually now + 300 seconds.
- Convert raw addresses to user-friendly form before building a transaction.
- With `@tonconnect/ui-react`, check `useIsConnectionRestored()` to tell "still restoring" from
  "disconnected". In Next.js App Router wrap the provider in a client component.
- Set `twaReturnUrl` so the wallet returns the user to Telegram.
