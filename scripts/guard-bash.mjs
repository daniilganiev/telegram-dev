#!/usr/bin/env node
// PreToolUse guard for Bash commands.
// Exit code 2 blocks the command and shows stderr to Claude.
import { readFileSync } from "node:fs";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const cmd = String(input?.tool_input?.command ?? "");
if (!cmd) process.exit(0);

const block = (msg) => { process.stderr.write(`[telegram-dev] ${msg}\n`); process.exit(2); };

// 1. Secrets must never be passed inline on the command line.
if (/\b(MNEMONIC|PRIVATE_KEY|BOT_TOKEN)\s*=/.test(cmd)) {
  block("Blocked: MNEMONIC/PRIVATE_KEY/BOT_TOKEN must not be passed inline. Ask the user to set it in their own environment or secrets manager.");
}

// 2. Commands that print secrets would put them into the conversation.
if (/\bacton\s+wallet\s+export-mnemonic\b/.test(cmd)) {
  block("Blocked: `acton wallet export-mnemonic` prints the seed phrase. The user must run it themselves in their own terminal if they need it.");
}
const readsSecretFile =
  /\b(cat|type|less|more|head|tail|bat|Get-Content|gc)\b[^|;&]*(^|[\s/\\"'])(\.env(?!\.example|\.sample)(\.\w+)?|wallets\.toml|[\w.-]*\.mnemonic|\.secrets[/\\]\S*)(\s|$|["'])/i;
if (readsSecretFile.test(cmd)) {
  block("Blocked: reading .env, wallets.toml or mnemonic files would expose secrets in the conversation. Ask the user which variable names are expected instead.");
}

// 3. Mainnet broadcasts are left to the user's own terminal.
const mainnet =
  /--net(?:work)?(?:=|\s+)mainnet\b/.test(cmd) ||
  /\b(?:TON_)?NETWORK\s*=\s*mainnet\b/.test(cmd);
if (mainnet) {
  block("Blocked: mainnet transactions are never sent from Claude. Finish testnet and the security review, then the user runs the mainnet command in their own terminal.");
}

process.exit(0);
