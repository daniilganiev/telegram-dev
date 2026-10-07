#!/usr/bin/env node
// PreToolUse guard for Write/Edit/MultiEdit: refuse to write real secrets into source files.
// `.env` and `.env.local` are the right place for tokens, so they are exempt.
import { readFileSync } from "node:fs";
import { basename } from "node:path";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const ti = input?.tool_input ?? {};
const file = String(ti.file_path ?? "");
const name = basename(file);
if (name === ".env" || name === ".env.local") process.exit(0);

const chunks = [ti.content, ti.new_string, ...(Array.isArray(ti.edits) ? ti.edits.map((e) => e?.new_string) : [])]
  .filter((c) => typeof c === "string");
const text = chunks.join("\n");
if (!text) process.exit(0);

const rules = [
  [/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/, "a Telegram bot token"],
  [/\bmnemonic\w*\s*[=:]\s*["'`](?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}["'`]/i, "a seed phrase"],
  [/\b(?:private|secret)[_-]?key\w*\s*[=:]\s*["'`]?[0-9a-fA-F]{64}\b/i, "a private key"],
];
for (const [re, what] of rules) {
  if (re.test(text)) {
    process.stderr.write(`[telegram-dev] Blocked: this write contains what looks like ${what}. Read it from an environment variable or secrets manager instead and put a placeholder in .env.example.\n`);
    process.exit(2);
  }
}
process.exit(0);
