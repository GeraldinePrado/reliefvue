import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const children = [];

function start(label, command, args) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`[dev] ${label} exited with code ${code}`);
      shutdown(code);
    }
  });
  children.push(child);
  return child;
}

let closing = false;
function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 600);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

start("platform api", path.join(root, "node_modules/.bin/tsx"), ["server/platform/index.ts"]);
start("vite", path.join(root, "node_modules/.bin/vite"), []);
