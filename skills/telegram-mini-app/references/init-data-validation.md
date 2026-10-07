# Validating Telegram Mini App initData (server side)

Source: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
(checked October 2026).

The Mini App receives `window.Telegram.WebApp.initData` (a query string). Send it to your
backend unchanged (an `Authorization: tma <initData>` header is a common convention) and verify
it before trusting any field. `initDataUnsafe` is for display only.

## With the bot token (your own backend)

1. Parse the query string. Remove **only** `hash` and keep its value. `signature`, if present,
   stays in the string.
2. `data_check_string`: the remaining `key=value` pairs sorted by key (byte order), joined with
   `\n`. Values are URL-decoded.
3. `secret_key = HMAC_SHA256(key = "WebAppData", message = bot_token)`.
4. `expected = hex(HMAC_SHA256(key = secret_key, message = data_check_string))`.
5. Compare `expected` with `hash` in constant time.
6. Reject if `auth_date` is older than your session allows (for example 24 hours, shorter for
   payments).

TypeScript (Node):

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

export function validateInitData(initData: string, botToken: string, maxAgeSec = 86400) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (expected.length !== hash.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(hash))) {
    return null;
  }

  const authDate = Number(params.get("auth_date"));
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return null;

  const user = params.get("user");
  return { user: user ? JSON.parse(user) : null, startParam: params.get("start_param") };
}
```

Python:

```python
import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl


def validate_init_data(init_data: str, bot_token: str, max_age_sec: int = 86400) -> dict | None:
    params = dict(parse_qsl(init_data, keep_blank_values=True, strict_parsing=True))
    received_hash = params.pop("hash", None)
    if not received_hash:
        return None

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    expected = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, received_hash):
        return None

    auth_date = int(params.get("auth_date", "0"))
    if not auth_date or time.time() - auth_date > max_age_sec:
        return None

    user = params.get("user")
    return {"user": json.loads(user) if user else None, "start_param": params.get("start_param")}
```

aiogram ships `aiogram.utils.web_app.safe_parse_webapp_init_data(token, init_data)` (raises
`ValueError` on a bad signature) and `@tma.js/init-data-node` covers Node; prefer them when the
project already uses those libraries. aiogram's helper does not reject old data, so check
`auth_date` yourself.

## Without the bot token (third parties)

A service that doesn't hold the token checks `signature`: a base64url Ed25519 signature over
`"<bot_id>:WebAppData\n"` followed by the fields **except `hash` and `signature`**, sorted and
joined with `\n`. Telegram publishes separate public keys for production and the test
environment on the page above; copy them from there, not from memory.

## Mistakes seen in the wild

- Validating on the client, or trusting `initDataUnsafe.user.id` sent in a JSON body.
- Removing `signature` along with `hash` before the HMAC check, so valid data fails.
- `localeCompare` or a case-insensitive sort instead of plain byte order.
- Comparing with `==`, which leaks timing.
- No `auth_date` limit, so a captured `initData` works forever.
