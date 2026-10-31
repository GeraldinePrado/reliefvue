import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";

const root = process.cwd();
const children = [];

/** A listener on any interface can still answer 127.0.0.1, so probe by connecting too. */
function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const finish = (inUse) => {
      socket.destroy();
      resolve(inUse);
    };
    socket.setTimeout(400);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

/** Prefer the requested port, then the next free one, so a busy port never blocks a demo. */
async function findFreePort(start) {
  for (let port = start; port <= start + 20; port += 1) {
    if (!(await portInUse(port))) return port;
  }
  throw new Error(`No free port between ${start} and ${start + 20}`);
}

function start(label, command, args, env) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...env, FORCE_COLOR: "1" },
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

const requested = Number(process.env.RV_PORT ?? process.env.PORT ?? 8788) || 8788;
const port = await findFreePort(requested);
if (port !== requested) {
  console.warn(`[dev] port ${requested} is busy; using ${port} for this run.`);
}
const env = { ...process.env, RV_PORT: String(port), PORT: String(port) };

console.log("");
console.log(`ReliefVue demo: open http://127.0.0.1:5173/app.html`);
console.log(`  API port ${port}`);
console.log("");

start("platform api", path.join(root, "node_modules/.bin/tsx"), ["server/platform/index.ts"], env);
start("vite", path.join(root, "node_modules/.bin/vite"), [], env);
