# Источники

Откуда взяты сведения в скиллах плагина. Проверено в октябре 2026. Всё быстро меняется,
поэтому скиллы везде отсылают к первоисточнику. Правило плагина: **документация и исходники
важнее каналов и чатов**; из каналов берутся новости и контекст, а в код и чек-листы попадает
только то, что подтверждено документацией.

## Каналы и чаты

| Источник | Что взято | Надёжность |
|---|---|---|
| [@anatolii_makosov](https://t.me/anatolii_makosov) | Хронология сети (Sub-Second, снижение комиссий, коллаторы), статусы `confirmed` и `finalized`, Streaming API v2, Jetton-2.1-tolk на minter.ton.org, спам-NFT после падения комиссий, Rust-нода экспериментальная, Tolk 1.3/1.4 и Acton | Автор из экосистемы TON; новости и контекст |
| [@tolk_lang](https://t.me/tolk_lang) | История версий Tolk (0.7 → 1.5), ломающие изменения (`address` только внутренний с 1.2, `ton()` → `grams()`, `bytesN` → `bitsN`), Acton, Actonscan, TON Verifier | Канал языка; версии сверены с changelog в документации |
| [@toncenter_news](https://t.me/toncenter_news) | Миграция с API v1 на `/api/v3`, Streaming API, декодированные тела сообщений, поля `is_scam` и `is_nsfw`, рекомендация показывать токены по opt-in | Канал TON Center |
| [github.com/ton-blockchain](https://github.com/ton-blockchain) | Репозитории `ton`, `acton`, `docs`, `TEPs`, `tg-wallet-contract`, `bug-bounty`; официальные skills для агентов | Первоисточник |
| [ton-blockchain/ton#2575](https://github.com/ton-blockchain/ton/pull/2575) | QUIC в публичных оверлеях вместо RLDP2, нужна нода версии 3.3+ | Касается операторов нод, не разработчиков приложений |
| [@tondev](https://t.me/tondev) (выгрузка чата) | Повторяющиеся проблемы разработчиков: форматы адресов, коды выхода, bounce, отправка на неразвёрнутый кошелёк, Highload, лимиты API, скам. Использовано только то, что подтверждено документацией | Мнения участников и ответы ИИ-ботов, часть устарела или неверна; сама выгрузка не публикуется (персональные данные) |
| [gramnews.org: карта экосистемы Q3 2026](https://gramnews.org/ru/articles/ton-ecosystem-map-q3-2026) | Контекст рынка: 373 проекта, 27 категорий, много тап-ботов. В код и чек-листы не вошло | Медиа, цифры не проверялись |

## Документация (первоисточники)

- TON: https://docs.ton.org (Tolk, TON Connect и `ton_proof`, платежи Gram и jetton, Streaming
  API и API v2/v3, лимиты TON Center, стандарты jetton и NFT, безопасность контрактов, коды
  выхода TVM, форматы адресов). Текст страниц доступен в markdown по адресам вида
  `https://docs.ton.org/llms/<раздел>/content.md`; индекс: https://docs.ton.org/llms.txt
- Acton: https://ton-blockchain.github.io/acton/docs (команды, тесты, кошельки, деплой,
  верификация, установка и WSL); индекс: https://ton-blockchain.github.io/acton/llms.txt
- Telegram: https://core.telegram.org/bots, `/bots/features`, `/bots/faq`, `/bots/api`,
  `/bots/api-changelog`, `/bots/webapps`, `/bots/payments-stars`, `/bots/payments`
- Клиенты Telegram: https://telegram.org/apps (для матрицы тестирования Mini App)
- Публикация плагина: https://claude.com/docs/directory/publish,
  https://claude.com/docs/plugins/pre-submission-checklist,
  https://code.claude.com/docs/en/plugins/manifest-reference
- TON Center API v3 (хосты, ключи по сетям, пагинация, коды ошибок):
  https://docs.ton.org/api/v3/overview
- Официальные skills TON для глубокой работы с контрактами: https://github.com/ton-blockchain/skills
- Статья-основа: https://claude.com/blog/build-plugins-for-claude

## Что проверено по первоисточнику и изменило плагин

- Цифровые товары внутри Telegram: **только Stars**, крипта запрещена (Telegram, `payments-stars`).
- `ton_proof`: ограничения длины payload, обязательная проверка сети, одноразовый nonce.
- Платежи: белый список jetton-мастеров, `forward_ton_amount` не меньше 1 нано-единицы,
  поиск сообщения по BOC только для UX, Streaming не восстанавливает пропущенное.
- Tolk: настоящий синтаксис (`struct (0x…)`, `else =>`, `BounceMode`, `grams()`).
- Acton: **нативный Windows не поддерживается (только WSL)**; `acton verify` работает только в
  testnet и платит за верификацию.
- `@ton/mcp` по умолчанию идёт в mainnet и хранит кошельки в обфусцированном реестре; поэтому
  с версии 0.3.0 плагин его не поставляет и читает сеть через публичное API TON Center.
- Лимиты Bot API и платные рассылки (FAQ Telegram).
- `initData`: для HMAC убирается только `hash`, поле `signature` остаётся в строке; для проверки
  без токена строка начинается с `<bot_id>:WebAppData` и без `hash` и `signature` (`/bots/webapps`).
- Изменения Bot API 9.4–10.3 (2026): боты видят часть сообщений других ботов в группах (10.0),
  `sendMessageDraft` живёт около 30 секунд и требует финального `sendMessage`, эфемерные
  сообщения перешли на `ephemeral_message_parameters` (10.3), `correct_option_ids` в опросах (9.6),
  managed bots (9.6), guest mode (10.0), запрет cross-origin вызовов Mini App с 20.07.2026 (10.2),
  обновления `subscription` (10.2), платные медиа до 25000 Stars.

Полные копии страниц лежат локально в `research/` (в git не попадают).
