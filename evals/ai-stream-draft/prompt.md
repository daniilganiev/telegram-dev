---
max_turns: 6
runs: 3
allowed_tools: [Read, Glob, Grep, Skill]
---

My Telegram bot (aiogram 3) answers users in a private chat. I already have `async def generate(text) -> AsyncIterator[str]` that yields chunks of the reply. I want the reply to appear progressively in the chat while chunks arrive. Write the aiogram handler; only the Telegram side matters.
