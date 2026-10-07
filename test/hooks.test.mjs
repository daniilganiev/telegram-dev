import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scripts = join(dirname(fileURLToPath(import.meta.url)), "..", "scripts");

const run = (script, payload, env = {}) =>
  spawnSync("node", [join(scripts, script)], {
    input: JSON.stringify(payload),
    encoding: "utf8",
    env: { ...process.env, ...env },
  });

const bash = (command, env) => run("guard-bash.mjs", { tool_input: { command } }, env);
const write = (file_path, content) => run("guard-secrets.mjs", { tool_input: { file_path, content } });

test("guard-bash allows ordinary acton commands", () => {
  for (const c of ["acton build", "acton test --coverage", "acton script scripts/deploy.tolk --net testnet", "cat .env.example"]) {
    assert.equal(bash(c).status, 0, c);
  }
});

test("guard-bash blocks mainnet without opt-in", () => {
  for (const c of ["acton script s.tolk --net mainnet", "acton script s.tolk --net=mainnet", "NETWORK=mainnet node x.js"]) {
    assert.equal(bash(c).status, 2, c);
  }
});

test("guard-bash blocks mainnet even with the old opt-in variable", () => {
  assert.equal(bash("acton script s.tolk --net mainnet", { TON_ALLOW_MAINNET: "1" }).status, 2);
});

test("guard-bash blocks inline secrets and secret-printing commands", () => {
  for (const c of [
    "MNEMONIC='a b c' acton script x.tolk",
    "BOT_TOKEN=123 node bot.js",
    "acton wallet export-mnemonic deployer",
    "cat .env",
    "cat wallets.toml",
    "type .env.local",
    "Get-Content .secrets/deployer.txt",
  ]) {
    assert.equal(bash(c).status, 2, c);
  }
});

test("guard-secrets blocks tokens, seed phrases and keys in source files", () => {
  const token = "123456789:" + "A".repeat(35);
  const seed = Array.from({ length: 12 }, () => "abandon").join(" ");
  assert.equal(write("src/bot.ts", `const t = "${token}";`).status, 2);
  assert.equal(write("scripts/d.ts", `const mnemonic = "${seed}";`).status, 2);
  assert.equal(write("src/k.ts", `const privateKey = "${"ab".repeat(32)}";`).status, 2);
  assert.equal(write("app/bot.py", `BOT_TOKEN = "${token}"`).status, 2);
  assert.equal(write("app/wallet.py", `MNEMONIC = "${seed}"`).status, 2);
});

test("guard-secrets lets .env and clean code through", () => {
  const token = "123456789:" + "A".repeat(35);
  assert.equal(write(".env", `BOT_TOKEN=${token}`).status, 0);
  assert.equal(write("src/bot.ts", "const t = process.env.BOT_TOKEN;").status, 0);
});

