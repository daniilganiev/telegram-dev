#!/usr/bin/env node
// PostToolUse: after a .tolk file is written/edited inside an Acton project,
// run `acton build` and surface compile errors to Claude (exit 2 = feedback).
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const file = input?.tool_input?.file_path;
if (!file || !String(file).endsWith(".tolk")) process.exit(0);

// Find the nearest Acton.toml above the edited file.
let dir = dirname(resolve(file));
let root = null;
for (let i = 0; i < 20; i++) {
  if (existsSync(join(dir, "Acton.toml"))) { root = dir; break; }
  const up = dirname(dir);
  if (up === dir) break;
  dir = up;
}
if (!root) process.exit(0);

let res = spawnSync("acton", ["build"], { cwd: root, encoding: "utf8", timeout: 120000 });
// Acton has no native Windows build; there it usually lives inside WSL.
if (res.error && process.platform === "win32") {
  // The script goes through stdin: wsl.exe re-joins argv and loses the quoting.
  res = spawnSync("wsl.exe", ["--cd", root, "--", "bash", "-ls"], {
    input: 'PATH="$HOME/.acton/bin:$PATH"; command -v acton >/dev/null || exit 127; acton build\n',
    encoding: "utf8", timeout: 120000,
  });
  if (res.status === 127) process.exit(0);
}
if (res.error) process.exit(0); // acton not installed: stay silent
if (res.status !== 0) {
  const out = `${res.stdout || ""}\n${res.stderr || ""}`.trim().split("\n").slice(-40).join("\n");
  process.stderr.write(`[telegram-dev] acton build failed after editing ${file}:\n${out}\n`);
  process.exit(2);
}
process.exit(0);
