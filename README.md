# Telegram Dev: Claude plugin

**EN:** A Claude plugin for building in Telegram the right way: bots in TypeScript or Python,
Mini Apps with server-side `initData` validation, Telegram Stars payments and the rules around
them, and TON where it meets Telegram (TON Connect, wallet login, TON and jetton payments,
NFTs, Tolk contracts). It focuses on the mistakes that cost money or get a bot hidden, and on
API changes newer than most answers you'll find. Community project, **not affiliated with or
endorsed by Telegram or the TON Foundation**.

**RU:** Плагин для Claude, чтобы делать в Telegram правильно: боты на TypeScript или Python,
Mini Apps с проверкой `initData` на сервере, платежи в Stars и правила вокруг них, и TON там,
где он касается Telegram (TON Connect, вход через кошелёк, приём TON и jetton, NFT, контракты
на Tolk). Упор на ошибки, которые стоят денег или приводят к скрытию бота, и на свежие изменения
API. Проект сообщества, **не связан с Telegram и TON Foundation и не одобрен ими**.

## Что внутри

### Скиллы (Claude подключает сам по смыслу запроса)

| Скилл | Что делает |
|---|---|
| `telegram-dev` | С чего начать: бот, Mini App или канал, как брать деньги, нужен ли блокчейн |
| `telegram-bot` | Боты на grammY и aiogram: вебхуки, лимиты, рассылки, автоматизация каналов, ИИ-боты со стримингом, Business и managed bots, изменения Bot API 2026 |
| `telegram-mini-app` | Mini App: SDK, темы, safe area, хранилища, проверка `initData` на TS и Python |
| `telegram-payments` | Stars: инвойсы, pre-checkout, возвраты, подписки, платные медиа, подарки, требования к запуску |
| `telegram-ton` | TON Connect, `ton_proof`, приём TON и jetton, NFT, чтение сети через TON Center, контракты на Tolk |
| `telegram-launch` | Чек-лист перед запуском, мониторинг, монетизация |

### Команды (запускает пользователь)

| Команда | Что делает |
|---|---|
| `/telegram-dev:new-bot <имя> [ts\|py]` | Новый бот на grammY или aiogram, готовый к вебхуку |
| `/telegram-dev:new-mini-app <имя> [ton]` | Новый Mini App с бэкендом; с `ton` — контракт и TON Connect через Acton |
| `/telegram-dev:add-payments [что продаём]` | Платежи в существующий проект, Stars по умолчанию |
| `/telegram-dev:add-ton-connect` | Подключение кошелька и вход через `ton_proof` |
| `/telegram-dev:audit-project` | Предрелизный аудит: секреты, сборка, тесты, ревьюеры |
| `/telegram-dev:deploy-testnet [скрипт]` | Пошаговый деплой контракта в testnet |

### Агенты

`telegram-security-reviewer` (бот, Mini App, платежи), `ton-security-reviewer` (контракты),
`tolk-test-writer` (тесты на Tolk).

### Хуки

Локальные Node-скрипты, ничего никуда не отправляют:
- не дают записать токен бота, сид-фразу или приватный ключ в исходники (`.env` исключён);
- блокируют передачу `MNEMONIC`/`PRIVATE_KEY`/`BOT_TOKEN` прямо в команде, чтение `.env` и
  `wallets.toml`, `acton wallet export-mnemonic`;
- блокируют `--net mainnet`, пока пользователь сам не запустил Claude Code с `TON_ALLOW_MAINNET=1`;
- после правки `.tolk` запускают `acton build` и показывают ошибки компиляции (если Acton есть).

Плагин не содержит MCP-серверов, не хранит кошельки и не подписывает транзакции. Всё, что
двигает деньги, пользователь подписывает в своём кошельке.

## Требования

- Claude Code для команд, агентов и хуков; скиллы работают и в других поверхностях Claude.
- Node.js 22+ для хуков.
- Для контрактов: [Acton](https://ton-blockchain.github.io/acton/docs/installation) 1.2.0+.
  **На Windows Acton работает только в WSL (Ubuntu 22.04+).** Без Acton всё остальное работает,
  а хук сборки молча пропускается.

## Установка

```bash
/plugin marketplace add daniilganiev/telegram-dev
/plugin install telegram-dev@telegram-dev-marketplace
```

Для разработки плагина:

```bash
claude --plugin-dir ./telegram-dev
claude plugin validate .claude-plugin/plugin.json --strict
node --test test/hooks.test.mjs
```

## Проверка качества

В `evals/` лежат задачи-ловушки с проверками: Claude решает их с плагином и без. Замер версии 0.3.0
(по одному прогону на задачу, 6 ловушек): с плагином 0.94, без 0.34. Разница там, где нужны свежие
факты и правила платформы: Stars вместо крипты для цифровых товаров, приём jetton, актуальный Tolk,
изменения Bot API 2026 года (эфемерные сообщения, `correct_option_ids`, `sendMessageDraft`). На темах,
которые Claude и так знает, разницы не было, поэтому скиллы там короткие.

## Безопасность

- TON по умолчанию в testnet, mainnet заблокирован хуком.
- Сид-фразы, приватные ключи и токены ботов не попадают в чат, логи и репозиторий.
- Хуки — страховка, а не замена ревью: они ловят типичные ошибки, но не любой обход.

## Источники

Откуда взяты сведения и что проверено по первоисточнику: [SOURCES.md](SOURCES.md).

## Лицензия

MIT
